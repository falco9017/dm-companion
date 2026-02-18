import { auth } from '@/lib/auth'
import { getCampaigns } from '@/actions/campaigns'
import { getSharedCampaigns, acceptPendingInvites } from '@/actions/campaign-members'
import { getUserProfile } from '@/actions/profile'
import { t, type Locale } from '@/lib/i18n'
import Link from 'next/link'
import { Plus, BookOpen, Users } from 'lucide-react'
import CampaignCard from '@/components/campaign/CampaignCard'

export default async function CampaignsPage() {
  const session = await auth()
  const userId = session!.user.id
  const userEmail = session!.user.email!

  // Accept any pending invites when visiting the campaigns page
  await acceptPendingInvites(userId, userEmail)

  const [campaigns, sharedCampaigns, profile] = await Promise.all([
    getCampaigns(userId),
    getSharedCampaigns(userId),
    getUserProfile(userId),
  ])

  const locale = (profile.uiLanguage === 'it' ? 'it' : 'en') as Locale
  const hasAnyCampaigns = campaigns.length > 0 || sharedCampaigns.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary text-glow">{t(locale, 'campaigns.title')}</h1>
        <Link
          href="/campaigns/new"
          className="btn-primary px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          {t(locale, 'campaigns.create')}
        </Link>
      </div>

      {!hasAnyCampaigns ? (
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
        <>
          {/* My Campaigns (DM) */}
          {campaigns.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                My Campaigns
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    userId={userId}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Shared With Me (Player) */}
          {sharedCampaigns.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Shared With Me
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {sharedCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/campaigns/${campaign.id}`}
                    className="block relative bg-surface border border-border-theme rounded-xl p-5 sm:p-6 hover:bg-white/[0.03] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-lg sm:text-xl font-bold text-text-primary group-hover:text-accent-purple-light transition-colors">
                        {campaign.name}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple-light shrink-0 mt-1">
                        Player
                      </span>
                    </div>
                    {campaign.description && (
                      <p className="text-text-muted text-sm mb-3 line-clamp-2">{campaign.description}</p>
                    )}
                    <p className="text-xs text-text-muted">
                      DM: {campaign.owner.name || campaign.owner.email}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
