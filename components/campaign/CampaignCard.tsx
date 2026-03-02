'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
    <Link href={`/campaigns/${campaign.id}`}>
      <div className={cn(
        'bg-card border border-border rounded-2xl p-5 sm:p-6 cursor-pointer transition-all group',
        'hover:border-primary/50 hover:shadow-md',
        isLocked && 'opacity-75'
      )}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="font-serif text-lg sm:text-xl font-medium group-hover:text-primary transition-colors">
            {campaign.name}
          </h2>
          {isLocked && (
            <Badge variant="outline" className="flex-shrink-0 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 gap-1">
              <Lock className="w-3 h-3" />
              View only
            </Badge>
          )}
        </div>
        {campaign.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>
        )}
      </div>
    </Link>
  )
}
