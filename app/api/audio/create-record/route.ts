import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { campaignId, blobUrl, blobPathname, filename, fileSize, mimeType } = await request.json()

    if (!campaignId || !blobUrl || !blobPathname || !filename) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify campaign ownership
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, ownerId: session.user.id },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found or unauthorized' }, { status: 404 })
    }

    // Check if record already exists (idempotent)
    const existing = await prisma.audioFile.findUnique({
      where: { blobKey: blobPathname },
    })

    if (existing) {
      return NextResponse.json({ audioFile: existing })
    }

    const audioFile = await prisma.audioFile.create({
      data: {
        filename,
        fileSize: fileSize || 0,
        mimeType: mimeType || 'audio/mpeg',
        blobUrl,
        blobKey: blobPathname,
        status: 'UPLOADED',
        campaignId,
      },
    })

    return NextResponse.json({ audioFile })
  } catch (error) {
    console.error('Create record error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create record' },
      { status: 500 }
    )
  }
}
