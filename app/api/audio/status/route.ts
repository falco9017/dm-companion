import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const audioFile = await prisma.audioFile.findUnique({
      where: { id },
      include: { campaign: true },
    })

    if (!audioFile || audioFile.campaign.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: audioFile.id,
      status: audioFile.status,
      errorMessage: audioFile.errorMessage,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    )
  }
}
