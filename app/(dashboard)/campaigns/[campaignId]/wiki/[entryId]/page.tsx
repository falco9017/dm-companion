import { redirect } from 'next/navigation'

export default async function WikiEntryPage({
  params,
}: {
  params: Promise<{ campaignId: string; entryId: string }>
}) {
  const { campaignId, entryId } = await params
  redirect(`/campaigns/${campaignId}?entry=${entryId}`)
}
