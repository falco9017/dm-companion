import { redirect } from 'next/navigation'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ campaignId: string }>
}) {
  const { campaignId } = await params
  redirect(`/campaigns/${campaignId}`)
}
