import { auth } from '@/lib/auth'
import { getCampaigns } from '@/actions/campaigns'
import Link from 'next/link'

export default async function CampaignsPage() {
  const session = await auth()
  const campaigns = await getCampaigns(session!.user.id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Your Campaigns</h1>
        <Link
          href="/campaigns/new"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Create Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/30 p-12 text-center">
          <p className="text-slate-300 text-lg mb-4">No campaigns yet</p>
          <Link
            href="/campaigns/new"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/30 p-6 hover:bg-white/20 transition-colors"
            >
              <h2 className="text-xl font-bold text-white mb-2">
                {campaign.name}
              </h2>
              {campaign.description && (
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                  {campaign.description}
                </p>
              )}
              <div className="flex gap-4 text-sm text-slate-400">
                <span>{campaign._count.audioFiles} audio files</span>
                <span>{campaign._count.wikiEntries} wiki entries</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
