import { redirect } from 'next/navigation'

export default async function UploadAudioPage({
  params,
}: {
  params: Promise<{ campaignId: string }>
}) {
  const { campaignId } = await params
  redirect(`/campaigns/${campaignId}/wiki`)
}
