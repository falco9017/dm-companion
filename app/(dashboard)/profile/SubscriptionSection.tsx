'use client'

import { useSession } from 'next-auth/react'
import { useI18n } from '@/lib/i18n-context'
import { toggleSubscription } from '@/actions/subscription'
import { Crown, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface SubscriptionSectionProps {
  userId: string
  subscriptionTier: string
  subscriptionStatus: string | null
}

export default function SubscriptionSection({
  userId,
  subscriptionTier,
  subscriptionStatus,
}: SubscriptionSectionProps) {
  const { t } = useI18n()
  const { update } = useSession()
  const [loading, setLoading] = useState(false)

  const isPro = subscriptionTier === 'pro'

  async function handleDowngrade() {
    setLoading(true)
    try {
      await toggleSubscription(userId)
      await update()
    } catch (error) {
      console.error('Toggle error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isPro ? (
          <Crown className="w-4 h-4 text-yellow-400" />
        ) : (
          <Zap className="w-4 h-4 text-text-muted" />
        )}
        <span className="text-sm text-text-secondary">{t('subscription.currentPlan')}</span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          isPro
            ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30'
            : 'bg-white/5 text-text-secondary border border-border-theme'
        }`}>
          {isPro ? t('subscription.pro') : t('subscription.basic')}
        </span>
        {isPro && subscriptionStatus && (
          <span className="text-xs text-text-muted">({t(`subscription.${subscriptionStatus}` as string)})</span>
        )}
      </div>

      {isPro ? (
        <button
          onClick={handleDowngrade}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg border border-border-theme text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : t('subscription.downgradToBasic')}
        </button>
      ) : (
        <Link
          href="/pricing"
          className="text-xs px-3 py-1.5 rounded-lg btn-primary flex items-center gap-1"
        >
          <Crown className="w-3 h-3" />
          {t('subscription.upgradeToPro')}
          <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}
