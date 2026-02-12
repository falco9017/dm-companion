import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { transcribeAudio, generateSummary } from '@/lib/gemini/audio-processor'
import { generateWikiEntries } from '@/lib/gemini/wiki-generator'
import { updateAudioFileStatus } from '@/actions/audio'

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
    await updateAudioFileStatus(audioFileId, 'PROCESSING')

    // Process in background
    processAudioInBackground(audioFileId, audioFile.blobUrl)

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

async function processAudioInBackground(audioFileId: string, blobUrl: string) {
  try {
    // Get audio file with campaign info
    const audioFile = await prisma.audioFile.findUnique({
      where: { id: audioFileId },
    })

    if (!audioFile) {
      throw new Error('Audio file not found')
    }

    // Transcribe audio
    console.log(`Transcribing audio file ${audioFileId}...`)
    const transcription = await transcribeAudio(blobUrl)

    // Generate summary
    console.log(`Generating summary for audio file ${audioFileId}...`)
    const summary = await generateSummary(transcription)

    // Update with results
    await updateAudioFileStatus(audioFileId, 'PROCESSED', {
      transcription,
      summary,
    })

    // Generate wiki entries
    console.log(`Generating wiki entries for audio file ${audioFileId}...`)
    await generateWikiEntries(
      audioFile.campaignId,
      audioFileId,
      transcription,
      summary
    )

    console.log(`Successfully processed audio file ${audioFileId}`)
  } catch (error) {
    console.error(`Failed to process audio file ${audioFileId}:`, error)
    await updateAudioFileStatus(audioFileId, 'FAILED', {
      errorMessage: error instanceof Error ? error.message : 'Processing failed',
    })
  }
}
