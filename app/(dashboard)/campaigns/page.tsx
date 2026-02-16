import { auth } from '@/lib/auth'
import { getCampaigns } from '@/actions/campaigns'
import Link from 'next/link'
import CampaignCard from '@/components/campaign/CampaignCard'

export default async function CampaignsPage() {
  const session = await auth()
  const campaigns = await getCampaigns(session!.user.id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Your Campaigns</h1>
        <Link
          href="/campaigns/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Create Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-12 text-center">
          <p className="text-gray-300 text-lg mb-4">No campaigns yet</p>
          <Link
            href="/campaigns/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              userId={session!.user.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
