import { auth } from '@/lib/auth'
import { getCampaigns } from '@/actions/campaigns'
import { getUserProfile } from '@/actions/profile'
import { t, type Locale } from '@/lib/i18n'
import { getEffectiveTier, getLimits } from '@/lib/subscription'
import Link from 'next/link'
import { Plus, BookOpen, Crown } from 'lucide-react'
import CampaignCard from '@/components/campaign/CampaignCard'

export default async function CampaignsPage() {
  const session = await auth()
  const userId = session!.user.id

  const [campaigns, profile, tier] = await Promise.all([
    getCampaigns(userId),
    getUserProfile(userId),
    getEffectiveTier(userId),
  ])

  const locale = (profile.uiLanguage === 'it' ? 'it' : 'en') as Locale
  const limits = getLimits(tier)
  const atCampaignLimit = limits.maxCampaigns !== Infinity && campaigns.length >= limits.maxCampaigns

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary text-glow">{t(locale, 'campaigns.title')}</h1>
        {atCampaignLimit ? (
          <Link
            href="/pricing"
            className="px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base border border-border-theme text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            <Crown className="w-4 h-4 text-yellow-400" />
            {t(locale, 'limits.upgrade')}
          </Link>
        ) : (
          <Link
            href="/campaigns/new"
            className="btn-primary px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            {t(locale, 'campaigns.create')}
          </Link>
        )}
      </div>

      {atCampaignLimit && (
        <div className="p-3 rounded-lg bg-yellow-400/5 border border-yellow-400/20 text-sm text-yellow-200/80">
          {t(locale, 'limits.campaignLimit')}
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="bg-surface border border-border-theme rounded-xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-purple/10 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-accent-purple-light" />
          </div>
          <p className="text-text-secondary text-lg mb-4">{t(locale, 'campaigns.noCampaigns')}</p>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            {t(locale, 'campaigns.createFirst')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
            />
          ))}
        </div>
      )}
    </div>
  )
}
