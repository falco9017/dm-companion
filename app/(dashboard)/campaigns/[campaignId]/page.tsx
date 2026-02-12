import { auth } from '@/lib/auth'
import { getCampaign } from '@/actions/campaigns'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CampaignPage({
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

  const sections = [
    {
      name: 'Audio Files',
      href: `/campaigns/${campaignId}/audio`,
      description: 'Upload and manage session recordings',
      count: campaign._count.audioFiles,
      icon: '🎵',
    },
    {
      name: 'Wiki',
      href: `/campaigns/${campaignId}/wiki`,
      description: 'Browse and search campaign information',
      count: campaign._count.wikiEntries,
      icon: '📚',
    },
    {
      name: 'AI Chat',
      href: `/campaigns/${campaignId}/chat`,
      description: 'Ask questions about your campaign',
      count: campaign._count.chatMessages,
      icon: '💬',
    },
    {
      name: 'Settings',
      href: `/campaigns/${campaignId}/settings`,
      description: 'Manage campaign settings',
      icon: '⚙️',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/campaigns"
          className="text-purple-300 hover:text-purple-200 text-sm mb-2 inline-block"
        >
          ← Back to Campaigns
        </Link>
        <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
        {campaign.description && (
          <p className="text-slate-300 mt-2">{campaign.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/30 p-6 hover:bg-white/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{section.icon}</span>
                  <h2 className="text-xl font-bold text-white">{section.name}</h2>
                </div>
                <p className="text-slate-300 text-sm mb-2">{section.description}</p>
                {section.count !== undefined && (
                  <p className="text-slate-400 text-sm">{section.count} items</p>
                )}
              </div>
              <span className="text-purple-300">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
