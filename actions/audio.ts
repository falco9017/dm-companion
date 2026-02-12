'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { AudioFileStatus } from '@prisma/client'

export async function getAudioFiles(campaignId: string, userId: string) {
  // Verify ownership
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ownerId: userId },
  })

  if (!campaign) {
    throw new Error('Campaign not found or unauthorized')
  }

  return await prisma.audioFile.findMany({
    where: { campaignId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAudioFile(audioFileId: string, userId: string) {
  const audioFile = await prisma.audioFile.findUnique({
    where: { id: audioFileId },
    include: { campaign: true },
  })

  if (!audioFile || audioFile.campaign.ownerId !== userId) {
    throw new Error('Audio file not found or unauthorized')
  }

  return audioFile
}

export async function updateAudioFileStatus(
  audioFileId: string,
  status: AudioFileStatus,
  data?: {
    transcription?: string
    summary?: string
    errorMessage?: string
  }
) {
  const audioFile = await prisma.audioFile.update({
    where: { id: audioFileId },
    data: {
      status,
      ...data,
    },
  })

  revalidatePath(`/campaigns/${audioFile.campaignId}/audio`)
  return audioFile
}

export async function deleteAudioFile(audioFileId: string, userId: string) {
  const audioFile = await prisma.audioFile.findUnique({
    where: { id: audioFileId },
    include: { campaign: true },
  })

  if (!audioFile || audioFile.campaign.ownerId !== userId) {
    throw new Error('Audio file not found or unauthorized')
  }

  await prisma.audioFile.delete({
    where: { id: audioFileId },
  })

  revalidatePath(`/campaigns/${audioFile.campaignId}/audio`)
}
