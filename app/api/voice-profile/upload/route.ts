import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

const ALLOWED_TYPES = [
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/x-m4a',
]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth()
        if (!session) {
          throw new Error('Unauthorized')
        }

        // Extract campaignId from pathname: voice-profiles/{campaignId}/{filename}
        const parts = pathname.split('/')
        const campaignId = parts[1]

        // Verify campaign ownership
        const campaign = await prisma.campaign.findFirst({
          where: { id: campaignId, ownerId: session.user.id },
        })

        if (!campaign) {
          throw new Error('Campaign not found or unauthorized')
        }

        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_SIZE,
          tokenPayload: JSON.stringify({
            campaignId,
            userId: session.user.id,
          }),
        }
      },
      onUploadCompleted: async () => {
        // No-op: profile record is created by the client via server action
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    )
  }
}
