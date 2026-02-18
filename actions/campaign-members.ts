'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCampaignAccess, isDM } from '@/lib/permissions'
import { sendCampaignInviteEmail } from '@/lib/email'

/**
 * DM invites a player by email. Creates a PENDING membership row.
 * If the user already has an account with that email, links them immediately.
 * Sends an invitation email notification.
 */
export async function inviteMember(campaignId: string, dmUserId: string, email: string) {
  const access = await getCampaignAccess(campaignId, dmUserId)
  if (!access || !isDM(access)) {
    throw new Error('Only the DM can invite members')
  }

  const normalizedEmail = email.toLowerCase().trim()

  // Check if already a member
  const existing = await prisma.campaignMember.findUnique({
    where: { campaignId_email: { campaignId, email: normalizedEmail } },
  })
  if (existing) {
    throw new Error('This email has already been invited')
  }

  // Check if a user with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  const member = await prisma.campaignMember.create({
    data: {
      campaignId,
      email: normalizedEmail,
      role: 'PLAYER',
      status: existingUser ? 'ACCEPTED' : 'PENDING',
      userId: existingUser?.id ?? null,
    },
  })

  // Send invitation email (non-blocking — don't fail the invite if email fails)
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { name: true, owner: { select: { name: true, email: true } } },
    })
    if (campaign) {
      const dmName = campaign.owner.name || campaign.owner.email
      const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || ''
      await sendCampaignInviteEmail(normalizedEmail, campaign.name, dmName, baseUrl)
    }
  } catch (error) {
    console.error('Failed to send invitation email:', error)
  }

  revalidatePath(`/campaigns/${campaignId}`)
  return member
}

/**
 * List all members of a campaign (DM only).
 */
export async function getCampaignMembers(campaignId: string, userId: string) {
  const access = await getCampaignAccess(campaignId, userId)
  if (!access || !isDM(access)) {
    throw new Error('Only the DM can view members')
  }

  return prisma.campaignMember.findMany({
    where: { campaignId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

/**
 * Remove a member from the campaign (DM only).
 * Also un-assigns any character sheet that was assigned to them.
 */
export async function removeMember(campaignId: string, dmUserId: string, memberId: string) {
  const access = await getCampaignAccess(campaignId, dmUserId)
  if (!access || !isDM(access)) {
    throw new Error('Only the DM can remove members')
  }

  const member = await prisma.campaignMember.findFirst({
    where: { id: memberId, campaignId },
  })
  if (!member) throw new Error('Member not found')

  // Un-assign any character sheet linked to this player
  if (member.userId) {
    await prisma.characterSheet.updateMany({
      where: { campaignId, assignedPlayerId: member.userId },
      data: { assignedPlayerId: null },
    })
  }

  await prisma.campaignMember.delete({ where: { id: memberId } })

  revalidatePath(`/campaigns/${campaignId}`)
}

/**
 * Assign an existing character sheet to a player (DM only).
 * Pass playerId = null to un-assign.
 */
export async function assignCharacterToPlayer(
  campaignId: string,
  dmUserId: string,
  characterSheetId: string,
  playerId: string | null
) {
  const access = await getCampaignAccess(campaignId, dmUserId)
  if (!access || !isDM(access)) {
    throw new Error('Only the DM can assign characters')
  }

  // Verify the character sheet belongs to this campaign
  const sheet = await prisma.characterSheet.findFirst({
    where: { id: characterSheetId, campaignId },
  })
  if (!sheet) throw new Error('Character sheet not found')

  // If assigning to a player, verify they are an accepted member
  if (playerId) {
    const member = await prisma.campaignMember.findFirst({
      where: { campaignId, userId: playerId, status: 'ACCEPTED' },
    })
    if (!member) throw new Error('Player is not an accepted member of this campaign')

    // Un-assign from any other sheet they currently have
    await prisma.characterSheet.updateMany({
      where: { campaignId, assignedPlayerId: playerId, id: { not: characterSheetId } },
      data: { assignedPlayerId: null },
    })
  }

  const updated = await prisma.characterSheet.update({
    where: { id: characterSheetId },
    data: { assignedPlayerId: playerId },
  })

  revalidatePath(`/campaigns/${campaignId}`)
  return updated
}

/**
 * When a user logs in, accept any PENDING invites matching their email.
 * Call this on the campaigns listing page load.
 */
export async function acceptPendingInvites(userId: string, email: string) {
  const normalizedEmail = email.toLowerCase().trim()

  await prisma.campaignMember.updateMany({
    where: { email: normalizedEmail, status: 'PENDING' },
    data: { userId, status: 'ACCEPTED' },
  })
}

/**
 * Get campaigns a user has been invited to (as a PLAYER) — for the campaigns list page.
 */
export async function getSharedCampaigns(userId: string) {
  return prisma.campaign.findMany({
    where: {
      members: {
        some: { userId, status: 'ACCEPTED', role: 'PLAYER' },
      },
    },
    include: {
      _count: {
        select: { audioFiles: true, wikiEntries: true },
      },
      owner: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Player creates their own character in a campaign they're a member of.
 * Creates the WikiEntry + CharacterSheet and assigns it to them.
 */
export async function createPlayerCharacter(
  campaignId: string,
  userId: string,
  characterName: string
) {
  // Verify user is an accepted member
  const member = await prisma.campaignMember.findFirst({
    where: { campaignId, userId, status: 'ACCEPTED' },
  })
  if (!member) throw new Error('Not a member of this campaign')

  // Check they don't already have a character
  const existing = await prisma.characterSheet.findFirst({
    where: { campaignId, assignedPlayerId: userId },
  })
  if (existing) throw new Error('You already have a character in this campaign')

  // Build slug
  const baseSlug = characterName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  let slug = baseSlug
  let counter = 1
  while (await prisma.wikiEntry.findUnique({ where: { campaignId_slug: { campaignId, slug } } })) {
    slug = `${baseSlug}-${counter++}`
  }

  const { createEmptyCharacterSheet } = await import('@/types/character-sheet')
  const emptyData = createEmptyCharacterSheet()
  emptyData.characterName = characterName

  const wikiEntry = await prisma.wikiEntry.create({
    data: {
      title: characterName,
      slug,
      type: 'CHARACTER',
      content: '',
      excerpt: '',
      isAutoGenerated: false,
      campaignId,
    },
  })

  const sheet = await prisma.characterSheet.create({
    data: {
      wikiEntryId: wikiEntry.id,
      campaignId,
      assignedPlayerId: userId,
      data: JSON.parse(JSON.stringify(emptyData)),
    },
  })

  revalidatePath(`/campaigns/${campaignId}`)
  return { wikiEntry, sheet }
}
