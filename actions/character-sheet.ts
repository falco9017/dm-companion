'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import type { CharacterSheetData } from '@/types/character-sheet'
import { getCampaignAccess, isDM } from '@/lib/permissions'

/** Check if a user can read a character sheet — DM gets all, player only their own. */
async function assertCanRead(sheet: { campaignId: string; assignedPlayerId: string | null }, userId: string) {
  const access = await getCampaignAccess(sheet.campaignId, userId)
  if (!access) throw new Error('Character sheet not found or unauthorized')
  if (!isDM(access) && sheet.assignedPlayerId !== userId) {
    throw new Error('Character sheet not found or unauthorized')
  }
  return access
}

/** Check if a user can write a character sheet — DM gets all, player only their own. */
async function assertCanWrite(sheet: { campaignId: string; assignedPlayerId: string | null }, userId: string) {
  return assertCanRead(sheet, userId)
}

export async function getCharacterSheet(wikiEntryId: string, userId: string) {
  const sheet = await prisma.characterSheet.findUnique({
    where: { wikiEntryId },
    include: {
      wikiEntry: {
        include: { campaign: { select: { ownerId: true } } },
      },
    },
  })

  if (!sheet) return null

  try {
    await assertCanRead(sheet, userId)
  } catch {
    return null
  }

  return sheet
}

export async function createCharacterSheet(
  campaignId: string,
  userId: string,
  wikiEntryId: string,
  data: CharacterSheetData
) {
  const entry = await prisma.wikiEntry.findUnique({
    where: { id: wikiEntryId },
    include: { campaign: { select: { ownerId: true } } },
  })

  if (!entry) throw new Error('Wiki entry not found or unauthorized')

  const access = await getCampaignAccess(campaignId, userId)
  if (!access || !isDM(access)) {
    throw new Error('Wiki entry not found or unauthorized')
  }

  if (entry.type !== 'CHARACTER') {
    throw new Error('Character sheets can only be attached to CHARACTER entries')
  }

  const sheet = await prisma.characterSheet.create({
    data: {
      wikiEntryId,
      campaignId,
      data: JSON.parse(JSON.stringify(data)),
    },
  })

  revalidatePath(`/campaigns/${campaignId}`)
  return sheet
}

export async function updateCharacterSheet(
  characterSheetId: string,
  userId: string,
  data: CharacterSheetData
) {
  const sheet = await prisma.characterSheet.findUnique({
    where: { id: characterSheetId },
    include: {
      wikiEntry: {
        include: { campaign: { select: { ownerId: true, id: true } } },
      },
    },
  })

  if (!sheet) throw new Error('Character sheet not found or unauthorized')

  await assertCanWrite(sheet, userId)

  const updated = await prisma.characterSheet.update({
    where: { id: characterSheetId },
    data: {
      data: JSON.parse(JSON.stringify(data)),
    },
  })

  revalidatePath(`/campaigns/${sheet.wikiEntry.campaign.id}`)
  return updated
}

export async function patchCharacterSheet(
  characterSheetId: string,
  userId: string,
  patch: Partial<CharacterSheetData>
) {
  const sheet = await prisma.characterSheet.findUnique({
    where: { id: characterSheetId },
    include: {
      wikiEntry: {
        include: { campaign: { select: { ownerId: true, id: true } } },
      },
    },
  })

  if (!sheet) throw new Error('Character sheet not found or unauthorized')

  await assertCanWrite(sheet, userId)

  const currentData = sheet.data as unknown as CharacterSheetData
  const mergedData = { ...currentData, ...patch }

  const updated = await prisma.characterSheet.update({
    where: { id: characterSheetId },
    data: {
      data: JSON.parse(JSON.stringify(mergedData)),
    },
  })

  revalidatePath(`/campaigns/${sheet.wikiEntry.campaign.id}`)
  return updated
}

export async function deleteCharacterSheet(characterSheetId: string, userId: string) {
  const sheet = await prisma.characterSheet.findUnique({
    where: { id: characterSheetId },
    include: {
      wikiEntry: {
        include: { campaign: { select: { ownerId: true, id: true } } },
      },
    },
  })

  if (!sheet) throw new Error('Character sheet not found or unauthorized')

  const access = await getCampaignAccess(sheet.campaignId, userId)
  if (!access || !isDM(access)) {
    throw new Error('Character sheet not found or unauthorized')
  }

  await prisma.characterSheet.delete({ where: { id: characterSheetId } })

  revalidatePath(`/campaigns/${sheet.wikiEntry.campaign.id}`)
}

/**
 * Get all character sheets in a campaign (for party overview).
 * Available to both DM and players.
 */
export async function getCampaignCharacterSheets(campaignId: string, userId: string) {
  const access = await getCampaignAccess(campaignId, userId)
  if (!access) throw new Error('Campaign not found or unauthorized')

  return prisma.characterSheet.findMany({
    where: { campaignId },
    include: {
      wikiEntry: { select: { id: true, title: true } },
      assignedPlayer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}
