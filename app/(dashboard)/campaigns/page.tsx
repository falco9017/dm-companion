import { auth } from '@/lib/auth'
import { getCampaigns } from '@/actions/campaigns'
import Link from 'next/link'
import { Plus, BookOpen } from 'lucide-react'
import CampaignCard from '@/components/campaign/CampaignCard'

export default async function CampaignsPage() {
  const session = await auth()
  const campaigns = await getCampaigns(session!.user.id)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary text-glow">Your Campaigns</h1>
        <Link
          href="/campaigns/new"
          className="btn-primary px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="glass-card rounded-xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-purple/10 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-accent-purple-light" />
          </div>
          <p className="text-text-secondary text-lg mb-4">No campaigns yet</p>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
