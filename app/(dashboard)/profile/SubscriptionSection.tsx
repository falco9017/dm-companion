'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-context'
import { toggleSubscription } from '@/actions/subscription'
import { Crown, Zap, ArrowRight, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface SubscriptionSectionProps {
  userId: string
  subscriptionTier: string
  subscriptionStatus: string | null
  campaignCount: number
}

export default function SubscriptionSection({
  userId,
  subscriptionTier,
  subscriptionStatus,
  campaignCount,
}: SubscriptionSectionProps) {
  const { t } = useI18n()
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const isPro = (session?.user?.subscriptionTier ?? subscriptionTier) === 'pro'

  async function handleDowngrade() {
    setLoading(true)
    setShowWarning(false)
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

  function handleDowngradeClick() {
    if (campaignCount > 1) {
      setShowWarning(true)
    } else {
      handleDowngrade()
    }
  }

  return (
    <>
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
            onClick={handleDowngradeClick}
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

      {/* Downgrade warning dialog */}
      {showWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWarning(false)} />
          <div className="relative bg-surface rounded-xl w-full max-w-sm mx-4 border border-border-theme p-6 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <h3 className="text-base font-bold text-text-primary">{t('limits.downgradeWarningTitle')}</h3>
            </div>
            <p className="text-sm text-text-muted mb-6">
              {t('limits.downgradeWarningBody')
                .replace('{count}', String(campaignCount))}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 text-sm rounded-lg border border-border-theme text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                {t('limits.keepPro')}
              </button>
              <button
                onClick={handleDowngrade}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-lg bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 border border-orange-500/30 transition-colors disabled:opacity-50"
              >
                {loading ? '...' : t('limits.downgradeConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
