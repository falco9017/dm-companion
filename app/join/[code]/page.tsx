import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import JoinCampaignClient from './JoinCampaignClient'

export default async function JoinCampaignPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const session = await auth()

  if (!session) {
    redirect(`/signin?callbackUrl=/join/${code}`)
  }

  const userId = session.user.id

  const campaign = await prisma.campaign.findUnique({
    where: { inviteCode: code },
    select: {
      id: true,
      name: true,
      ownerId: true,
      owner: { select: { name: true, email: true } },
      members: {
        where: { userId },
        select: { status: true },
      },
    },
  })

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold">Invalid Invite</h1>
          <p className="text-muted-foreground">This invite link is invalid or has expired.</p>
          <a href="/campaigns" className="text-primary hover:underline">
            Go to your campaigns
          </a>
        </div>
      </div>
    )
  }

  // Already the DM or an accepted member — redirect straight in
  if (campaign.ownerId === userId || campaign.members[0]?.status === 'ACCEPTED') {
    redirect(`/campaigns/${campaign.id}`)
  }

  const dmName = campaign.owner.name || campaign.owner.email

  return (
    <JoinCampaignClient
      code={code}
      campaignId={campaign.id}
      campaignName={campaign.name}
      dmName={dmName}
      userId={userId}
      userName={session.user.name || session.user.email || ''}
    />
  )
}
