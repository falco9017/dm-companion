'use client'

import Link from 'next/link'

interface CampaignCardProps {
  campaign: {
    id: string
    name: string
    description: string | null
  }
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="block relative bg-surface border border-border-theme rounded-xl p-5 sm:p-6 hover:bg-white/[0.03] transition-all group"
    >
      <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-2 group-hover:text-accent-purple-light transition-colors">
        {campaign.name}
      </h2>
      {campaign.description && (
        <p className="text-text-muted text-sm line-clamp-2">
          {campaign.description}
        </p>
      )}
    </Link>
  )
}
