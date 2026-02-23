'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db'
import { getCampaignAccess, isDM } from '@/lib/permissions'
import { canCreateCampaign } from '@/lib/subscription'

export async function createCampaign(userId: string, name: string, description?: string, language = 'en') {
  // Subscription check
  const check = await canCreateCampaign(userId)
  if (!check.allowed) {
    throw new Error('SUBSCRIPTION_LIMIT: campaign_limit_reached')
  }

  const campaign = await prisma.campaign.create({
    data: {
      name,
      description,
      language,
      ownerId: userId,
    },
  })

  // Set as default if it's the user's first campaign
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { defaultCampaignId: true },
  })

  if (!user?.defaultCampaignId) {
    await prisma.user.update({
      where: { id: userId },
      data: { defaultCampaignId: campaign.id },
    })
  }

  revalidatePath('/campaigns')
  return campaign
}

export async function getCampaigns(userId: string) {
  return await prisma.campaign.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getCampaign(campaignId: string, userId: string) {
  return await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId, status: 'ACCEPTED' } } },
      ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      language: true,
      ownerId: true,
      inviteCode: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          audioFiles: true,
          wikiEntries: true,
          chatMessages: true,
        },
      },
    },
  })
}

export async function generateInviteCode(campaignId: string, userId: string) {
  const access = await getCampaignAccess(campaignId, userId)
  if (!access || !isDM(access)) {
    throw new Error('Only the DM can generate invite codes')
  }

  const code = randomBytes(4).toString('hex').toUpperCase()
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { inviteCode: code },
  })

  revalidatePath(`/campaigns/${campaignId}`)
  return code
}

export async function joinCampaignByCode(inviteCode: string, userId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { inviteCode },
    select: { id: true, ownerId: true },
  })

  if (!campaign) {
    return { error: 'Invalid or expired invite link' }
  }

  // Already the owner
  if (campaign.ownerId === userId) {
    return { campaignId: campaign.id }
  }

  // Already a member
  const existing = await prisma.campaignMember.findFirst({
    where: { campaignId: campaign.id, userId },
  })
  if (existing) {
    return { campaignId: campaign.id }
  }

  // Get user email for the member row
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })
  if (!user) return { error: 'User not found' }

  await prisma.campaignMember.create({
    data: {
      campaignId: campaign.id,
      userId,
      email: user.email,
      role: 'PLAYER',
      status: 'ACCEPTED',
    },
  })

  revalidatePath('/campaigns')
  return { campaignId: campaign.id }
}

export async function setDefaultCampaign(userId: string, campaignId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { defaultCampaignId: campaignId },
  })

  revalidatePath('/campaigns')
}

export async function deleteCampaign(campaignId: string, userId: string) {
  const access = await getCampaignAccess(campaignId, userId)
  if (!access || !isDM(access)) {
    throw new Error('Campaign not found or unauthorized')
  }

  await prisma.campaign.delete({
    where: { id: campaignId },
  })

  revalidatePath('/campaigns')
  redirect('/campaigns')
}

export async function updateCampaign(
  campaignId: string,
  userId: string,
  data: { name?: string; description?: string; language?: string }
) {
  const access = await getCampaignAccess(campaignId, userId)
  if (!access || !isDM(access)) {
    throw new Error('Campaign not found or unauthorized')
  }

  const updated = await prisma.campaign.update({
    where: { id: campaignId },
    data,
  })

  revalidatePath(`/campaigns/${campaignId}`)
  return updated
}
