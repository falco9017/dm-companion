import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateWikiFromRecaps } from '@/lib/gemini/wiki-generator'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { campaignId, userInstructions } = await request.json()

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Missing campaignId' },
        { status: 400 }
      )
    }

    // Verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign || campaign.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Campaign not found or unauthorized' },
        { status: 404 }
      )
    }

    const result = await generateWikiFromRecaps(
      campaignId,
      campaign.language,
      userInstructions || undefined
    )

    revalidatePath(`/campaigns/${campaignId}`)

    return NextResponse.json({
      success: true,
      created: result.created,
      updated: result.updated,
    })
  } catch (error) {
    console.error('Wiki generate error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
