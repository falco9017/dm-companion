import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadAudioToBlob } from '@/lib/storage/vercel-blob'

const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/x-m4a']
const MAX_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const campaignId = formData.get('campaignId') as string

    if (!file || !campaignId) {
      return NextResponse.json(
        { error: 'Missing file or campaignId' },
        { status: 400 }
      )
    }

    // Verify campaign ownership
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, ownerId: session.user.id },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found or unauthorized' },
        { status: 404 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: MP3, WAV, M4A, OGG' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 100MB' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const timestamp = Date.now()
    const filename = `${campaignId}/${timestamp}-${file.name}`
    const { url, key } = await uploadAudioToBlob(file, filename)

    // Create database record
    const audioFile = await prisma.audioFile.create({
      data: {
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        blobUrl: url,
        blobKey: key,
        status: 'UPLOADED',
        campaignId,
      },
    })

    return NextResponse.json({
      success: true,
      audioFile,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
