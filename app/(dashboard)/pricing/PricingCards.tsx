'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-context'
import { toggleSubscription } from '@/actions/subscription'
import { Check, X, Crown } from 'lucide-react'

interface PricingCardsProps {
  userId: string
  currentTier: string
}

export default function PricingCards({ userId, currentTier }: PricingCardsProps) {
  const { t } = useI18n()
  const { data: session, update } = useSession()
  const router = useRouter()
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState(false)

  const isPro = (session?.user?.subscriptionTier ?? currentTier) === 'pro'

  async function handleToggle() {
    setLoading(true)
    try {
      await toggleSubscription(userId)
      await update()
      router.refresh()
    } catch (error) {
      console.error('Toggle error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Monthly / Annual toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={`text-sm ${!annual ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
          {t('pricing.monthly')}
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            annual ? 'bg-accent-purple' : 'bg-white/10'
          }`}
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            annual ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </button>
        <span className={`text-sm ${annual ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
          {t('pricing.annual')}
        </span>
        {annual && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
            {t('pricing.saveBadge')}
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Basic card */}
        <div className={`flex flex-col rounded-xl p-6 sm:p-8 bg-surface border transition-colors ${
          !isPro ? 'border-accent-purple/50' : 'border-border-theme'
        }`}>
          <h3 className="text-xl font-bold text-text-primary mb-1">{t('pricing.basicName')}</h3>
          <div className="mb-6">
            <span className="text-3xl font-bold text-text-primary">{t('pricing.basicPrice')}</span>
          </div>

          <ul className="space-y-3 mb-8">
            <Feature text={t('pricing.basicFeature1')} />
            <Feature text={t('pricing.basicFeature2')} />
            <Feature text={t('pricing.basicFeature3')} />
            <Feature text={t('pricing.basicFeature4')} />
            <FeatureNo text={t('pricing.basicNoChat')} />
          </ul>

          <div className="mt-auto">
            {!isPro ? (
              <div className="w-full py-2.5 rounded-lg border border-accent-purple/30 text-center text-sm font-medium text-accent-purple-light">
                {t('pricing.currentPlan')}
              </div>
            ) : (
              <button
                onClick={handleToggle}
                disabled={loading}
                className="w-full py-2.5 rounded-lg border border-border-theme text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                {loading ? '...' : t('subscription.downgradToBasic')}
              </button>
            )}
          </div>
        </div>

        {/* Pro card */}
        <div className={`flex flex-col rounded-xl p-6 sm:p-8 bg-surface border-2 transition-colors ${
          isPro ? 'border-yellow-400/50' : 'border-accent-purple'
        }`}>
          <h3 className="text-xl font-bold text-text-primary mb-1">{t('pricing.proName')}</h3>
          <div className="mb-6">
            <span className="text-3xl font-bold text-text-primary">
              {annual ? t('pricing.proAnnual') : t('pricing.proMonthly')}
            </span>
            <span className="text-text-muted text-sm ml-1">
              {annual ? t('pricing.perYear') : t('pricing.perMonth')}
            </span>
          </div>

          <ul className="space-y-3 mb-8">
            <Feature text={t('pricing.proFeature1')} />
            <Feature text={t('pricing.proFeature2')} />
            <Feature text={t('pricing.proFeature3')} />
            <Feature text={t('pricing.proFeature4')} />
            <Feature text={t('pricing.proFeature5')} />
            <Feature text={t('pricing.proFeature6')} />
          </ul>

          <div className="mt-auto">
            {isPro ? (
              <div className="w-full py-2.5 rounded-lg border border-yellow-400/30 text-center text-sm font-medium text-yellow-400">
                {t('pricing.currentPlan')}
              </div>
            ) : (
              <button
                onClick={handleToggle}
                disabled={loading}
                className="w-full btn-primary py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Crown className="w-4 h-4" />
                {loading ? '...' : t('pricing.subscribe')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-text-secondary">
      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
      {text}
    </li>
  )
}

function FeatureNo({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-text-muted">
      <X className="w-4 h-4 text-text-muted flex-shrink-0" />
      {text}
    </li>
  )
}
