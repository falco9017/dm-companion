'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCampaignAccess, isDM } from '@/lib/permissions'
import { del } from '@vercel/blob'

export async function getVoiceProfiles(campaignId: string, userId: string) {
  const access = await getCampaignAccess(campaignId, userId)
  if (!access) {
    throw new Error('Campaign not found or unauthorized')
  }

  return prisma.voiceProfile.findMany({
    where: { campaignId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createVoiceProfile(
  campaignId: string,
  userId: string,
  name: string,
  role: string,
  blobUrl: string,
  blobKey: string
) {
  const access = await getCampaignAccess(campaignId, userId)
  if (!access || !isDM(access)) {
    throw new Error('Campaign not found or unauthorized')
  }

  const profile = await prisma.voiceProfile.create({
    data: {
      campaignId,
      name,
      role,
      blobUrl,
      blobKey,
    },
  })

  revalidatePath(`/campaigns/${campaignId}`)
  return profile
}

export async function deleteVoiceProfile(profileId: string, userId: string) {
  const profile = await prisma.voiceProfile.findUnique({
    where: { id: profileId },
    include: { campaign: { select: { id: true } } },
  })

  if (!profile) {
    throw new Error('Voice profile not found')
  }

  const access = await getCampaignAccess(profile.campaign.id, userId)
  if (!access || !isDM(access)) {
    throw new Error('Unauthorized')
  }

  // Delete blob from storage
  try {
    await del(profile.blobUrl)
  } catch (err) {
    console.error('Failed to delete voice profile blob (non-fatal):', err)
  }

  await prisma.voiceProfile.delete({ where: { id: profileId } })

  revalidatePath(`/campaigns/${profile.campaign.id}`)
}
