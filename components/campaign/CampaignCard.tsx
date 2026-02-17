'use client'

import Link from 'next/link'
import { Music, BookOpen } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'

interface CampaignCardProps {
  campaign: {
    id: string
    name: string
    description: string | null
    _count: {
      audioFiles: number
      wikiEntries: number
    }
  }
  userId: string
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const { t } = useI18n()

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="block relative bg-surface border border-border-theme rounded-xl p-5 sm:p-6 hover:bg-white/[0.03] transition-all group"
    >
      <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-2 group-hover:text-accent-purple-light transition-colors">
        {campaign.name}
      </h2>
      {campaign.description && (
        <p className="text-text-muted text-sm mb-4 line-clamp-2">
          {campaign.description}
        </p>
      )}
      <div className="flex gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <Music className="w-3 h-3" />
          {campaign._count.audioFiles} {t('campaigns.audio')}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          {campaign._count.wikiEntries} {t('campaigns.wiki')}
        </span>
      </div>
    </Link>
  )
}
