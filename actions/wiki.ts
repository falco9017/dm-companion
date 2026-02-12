'use server'

import { prisma } from '@/lib/db'
import { WikiEntryType } from '@prisma/client'

export async function getWikiEntries(
  campaignId: string,
  userId: string,
  filters?: {
    type?: WikiEntryType
    search?: string
    tags?: string[]
  }
) {
  // Verify ownership
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerId: userId },
  })

  if (!campaign) {
    throw new Error('Campaign not found or unauthorized')
  }

  const where: any = { campaignId }

  if (filters?.type) {
    where.type = filters.type
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
      { excerpt: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  if (filters?.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags }
  }

  return await prisma.wikiEntry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      audioFile: {
        select: {
          id: true,
          filename: true,
        },
      },
    },
  })
}

export async function getWikiEntry(entryId: string, userId: string) {
  const entry = await prisma.wikiEntry.findUnique({
    where: { id: entryId },
    include: {
      campaign: true,
      audioFile: {
        select: {
          id: true,
          filename: true,
        },
      },
      children: true,
    },
  })

  if (!entry || entry.campaign.ownerId !== userId) {
    throw new Error('Wiki entry not found or unauthorized')
  }

  return entry
}

export async function searchWikiEntries(
  campaignId: string,
  userId: string,
  query: string
) {
  // Verify ownership
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerId: userId },
  })

  if (!campaign) {
    throw new Error('Campaign not found or unauthorized')
  }

  return await prisma.wikiEntry.findMany({
    where: {
      campaignId,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
        { tags: { has: query.toLowerCase() } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
}

export async function getWikiEntriesByType(
  campaignId: string,
  userId: string
) {
  // Verify ownership
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerId: userId },
  })

  if (!campaign) {
    throw new Error('Campaign not found or unauthorized')
  }

  const entries = await prisma.wikiEntry.groupBy({
    by: ['type'],
    where: { campaignId },
    _count: true,
  })

  return entries
}
