import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/x-m4a']
const MAX_SIZE = 100 * 1024 * 1024 // 100MB

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

        // Extract campaignId from pathname: {campaignId}/{timestamp}-{filename}
        const campaignId = pathname.split('/')[0]

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
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const { campaignId } = JSON.parse(tokenPayload!)

        // Skip if record already exists (client creates it directly now)
        const existing = await prisma.audioFile.findUnique({
          where: { blobKey: blob.pathname },
        })
        if (existing) return

        // Extract original filename from blob pathname
        const parts = blob.pathname.split('/')
        const filenameWithTimestamp = parts[parts.length - 1]
        const originalFilename = filenameWithTimestamp.replace(/^\d+-/, '')

        await prisma.audioFile.create({
          data: {
            filename: originalFilename,
            fileSize: 0,
            mimeType: blob.contentType ?? 'audio/mpeg',
            blobUrl: blob.url,
            blobKey: blob.pathname,
            status: 'UPLOADED',
            campaignId,
          },
        })
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
