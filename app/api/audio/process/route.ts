import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { transcribeAudio, generateSummary } from '@/lib/gemini/audio-processor'
import { createSessionRecap } from '@/lib/gemini/wiki-generator'
import { revalidatePath } from 'next/cache'
import { del } from '@vercel/blob'
import { canProcessAudio, incrementAudioUsage, getEffectiveTier, getLimits } from '@/lib/subscription'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { audioFileId } = await request.json()

    if (!audioFileId) {
      return NextResponse.json(
        { error: 'Missing audioFileId' },
        { status: 400 }
      )
    }

    // Get audio file and verify ownership
    const audioFile = await prisma.audioFile.findUnique({
      where: { id: audioFileId },
      include: { campaign: true },
    })

    if (!audioFile || audioFile.campaign.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Audio file not found or unauthorized' },
        { status: 404 }
      )
    }

    if (audioFile.status === 'PROCESSING') {
      return NextResponse.json(
        { error: 'Already processing' },
        { status: 400 }
      )
    }

    // Subscription check: can this user process audio?
    const audioCheck = await canProcessAudio(session.user.id)
    if (!audioCheck.allowed) {
      return NextResponse.json(
        { error: 'subscription_limit', reason: audioCheck.reason },
        { status: 403 }
      )
    }

    // Check audio duration against tier limit
    const tier = await getEffectiveTier(session.user.id)
    const limits = getLimits(tier)
    if (audioFile.duration && audioFile.duration > limits.maxAudioDurationSec) {
      return NextResponse.json(
        { error: 'subscription_limit', reason: 'audio_too_long' },
        { status: 403 }
      )
    }

    // Update status to PROCESSING
    await prisma.audioFile.update({
      where: { id: audioFileId },
      data: { status: 'PROCESSING' },
    })

    // Increment usage counter
    await incrementAudioUsage(session.user.id)

    // Process in background (fire-and-forget)
    processAudioInBackground(audioFileId, audioFile.blobUrl, audioFile.campaignId, audioFile.campaign.language, session.user.id, audioFile.recordingDate ?? undefined)

    return NextResponse.json({
      success: true,
      message: 'Processing started',
    })
  } catch (error) {
    console.error('Process error:', error)
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
}

async function processAudioInBackground(audioFileId: string, blobUrl: string, campaignId: string, language: string, userId: string, recordingDate?: Date) {
  try {
    // Transcribe audio
    console.log(`Transcribing audio file ${audioFileId}...`)
    const transcription = await transcribeAudio(blobUrl, userId, campaignId)

    // Generate summary
    console.log(`Generating summary for audio file ${audioFileId}...`)
    const summary = await generateSummary(transcription, language, userId, campaignId)

    // Update with transcription and summary
    await prisma.audioFile.update({
      where: { id: audioFileId },
      data: { status: 'PROCESSED', transcription, summary },
    })

    // Delete audio blob to save storage
    try {
      await del(blobUrl)
      console.log(`Deleted audio blob for file ${audioFileId}`)
    } catch (blobError) {
      console.error(`Failed to delete audio blob (non-fatal):`, blobError)
    }

    // Create session recap entry only — wiki entity extraction happens
    // later when the user explicitly clicks "Update Wiki" in the review stage
    console.log(`Creating session recap for audio file ${audioFileId}...`)
    await createSessionRecap(campaignId, audioFileId, summary, transcription, recordingDate)

    revalidatePath(`/campaigns/${campaignId}`)
    console.log(`Successfully processed audio file ${audioFileId}`)
  } catch (error) {
    console.error(`Failed to process audio file ${audioFileId}:`, error)
    await prisma.audioFile.update({
      where: { id: audioFileId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Processing failed',
      },
    })
  }
}
