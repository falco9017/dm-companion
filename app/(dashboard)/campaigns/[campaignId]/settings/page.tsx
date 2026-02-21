import { auth } from '@/lib/auth'
import { getCampaign } from '@/actions/campaigns'
import { notFound } from 'next/navigation'
import CampaignSettings from './CampaignSettings'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ campaignId: string }>
}) {
  const { campaignId } = await params
  const session = await auth()
  const userId = session!.user.id

  const campaign = await getCampaign(campaignId, userId)
  if (!campaign) {
    notFound()
  }

  return (
    <CampaignSettings
      campaignId={campaignId}
      userId={userId}
      campaign={{
        name: campaign.name,
        description: campaign.description,
        language: campaign.language,
      }}
    />
  )
}
