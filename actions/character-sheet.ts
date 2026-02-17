'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import type { CharacterSheetData } from '@/types/character-sheet'

export async function getCharacterSheet(wikiEntryId: string, userId: string) {
  const sheet = await prisma.characterSheet.findUnique({
    where: { wikiEntryId },
    include: {
      wikiEntry: {
        include: { campaign: { select: { ownerId: true } } },
      },
    },
  })

  if (!sheet || sheet.wikiEntry.campaign.ownerId !== userId) {
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

  if (!entry || entry.campaign.ownerId !== userId) {
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

  if (!sheet || sheet.wikiEntry.campaign.ownerId !== userId) {
    throw new Error('Character sheet not found or unauthorized')
  }

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

  if (!sheet || sheet.wikiEntry.campaign.ownerId !== userId) {
    throw new Error('Character sheet not found or unauthorized')
  }

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

  if (!sheet || sheet.wikiEntry.campaign.ownerId !== userId) {
    throw new Error('Character sheet not found or unauthorized')
  }

  await prisma.characterSheet.delete({ where: { id: characterSheetId } })

  revalidatePath(`/campaigns/${sheet.wikiEntry.campaign.id}`)
}
