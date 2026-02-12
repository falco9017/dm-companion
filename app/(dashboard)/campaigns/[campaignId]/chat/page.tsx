import { auth } from '@/lib/auth'
import { getCampaign } from '@/actions/campaigns'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ChatInterface from '@/components/chat/ChatInterface'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ campaignId: string }>
}) {
  const { campaignId } = await params
  const session = await auth()
  const campaign = await getCampaign(campaignId, session!.user.id)

  if (!campaign) {
    notFound()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href={`/campaigns/${campaignId}`}
          className="text-purple-300 hover:text-purple-200 text-sm mb-2 inline-block"
        >
          ← Back to Campaign
        </Link>
        <h1 className="text-3xl font-bold text-white">AI Chat Assistant</h1>
        <p className="text-slate-300 mt-2">
          Ask questions about your campaign and get AI-powered responses based on your wiki
        </p>
      </div>

      <ChatInterface campaignId={campaignId} />
    </div>
  )
}
