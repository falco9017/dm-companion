'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'

interface CampaignCardProps {
  campaign: {
    id: string
    name: string
    description: string | null
  }
  isLocked?: boolean
}

export default function CampaignCard({ campaign, isLocked }: CampaignCardProps) {
  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="block relative bg-surface border border-border-theme rounded-xl p-5 sm:p-6 hover:bg-white/[0.03] transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary group-hover:text-accent-purple-light transition-colors">
          {campaign.name}
        </h2>
        {isLocked && (
          <span className="flex items-center gap-1 flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Lock className="w-3 h-3" />
            View only
          </span>
        )}
      </div>
      {campaign.description && (
        <p className="text-text-muted text-sm line-clamp-2">
          {campaign.description}
        </p>
      )}
    </Link>
  )
}
