'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

export async function createCampaign(userId: string, name: string, description?: string) {
  const campaign = await prisma.campaign.create({
    data: {
      name,
      description,
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
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          audioFiles: true,
          wikiEntries: true,
        },
      },
    },
  })
}

export async function getCampaign(campaignId: string, userId: string) {
  return await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      ownerId: userId,
    },
    include: {
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

export async function setDefaultCampaign(userId: string, campaignId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { defaultCampaignId: campaignId },
  })

  revalidatePath('/campaigns')
}

export async function deleteCampaign(campaignId: string, userId: string) {
  // Verify ownership
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerId: userId },
  })

  if (!campaign) {
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
  data: { name?: string; description?: string }
) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerId: userId },
  })

  if (!campaign) {
    throw new Error('Campaign not found or unauthorized')
  }

  const updated = await prisma.campaign.update({
    where: { id: campaignId },
    data,
  })

  revalidatePath(`/campaigns/${campaignId}`)
  return updated
}
