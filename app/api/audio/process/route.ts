import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { transcribeAudio, generateSummary } from '@/lib/gemini/audio-processor'
import { generateWikiEntries } from '@/lib/gemini/wiki-generator'
import { revalidatePath } from 'next/cache'

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

    // Update status to PROCESSING
    await prisma.audioFile.update({
      where: { id: audioFileId },
      data: { status: 'PROCESSING' },
    })

    // Process in background (fire-and-forget)
    processAudioInBackground(audioFileId, audioFile.blobUrl, audioFile.campaignId, audioFile.campaign.language)

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

async function processAudioInBackground(audioFileId: string, blobUrl: string, campaignId: string, language: string) {
  try {
    // Transcribe audio
    console.log(`Transcribing audio file ${audioFileId}...`)
    const transcription = await transcribeAudio(blobUrl)

    // Generate summary
    console.log(`Generating summary for audio file ${audioFileId}...`)
    const summary = await generateSummary(transcription, language)

    // Update with transcription and summary
    await prisma.audioFile.update({
      where: { id: audioFileId },
      data: { status: 'PROCESSED', transcription, summary },
    })

    // Generate wiki entries
    console.log(`Generating wiki entries for audio file ${audioFileId}...`)
    await generateWikiEntries(campaignId, audioFileId, transcription, summary, language)

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
