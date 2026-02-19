'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n-context'
import { toggleSubscription } from '@/actions/subscription'
import { Crown, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface SubscriptionSectionProps {
  userId: string
  subscriptionTier: string
  subscriptionStatus: string | null
  subscriptionPeriodEnd: string | null
  audioUsedThisMonth: number
  audioLimit: number | null // null = unlimited
}

export default function SubscriptionSection({
  userId,
  subscriptionTier,
  subscriptionStatus,
  subscriptionPeriodEnd,
  audioUsedThisMonth,
  audioLimit,
}: SubscriptionSectionProps) {
  const { t } = useI18n()
  const { update } = useSession()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const isPro = subscriptionTier === 'pro'

  // Handle checkout success
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setShowSuccess(true)
      update() // Refresh JWT with new subscription tier
      const timer = setTimeout(() => setShowSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, update])

  async function handleToggle() {
    setLoading(true)
    try {
      await toggleSubscription(userId)
      await update() // Refresh JWT
    } catch (error) {
      console.error('Toggle error:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusKey = `subscription.${subscriptionStatus}` as string
  const statusLabel = subscriptionStatus
    ? t(statusKey)
    : null

  return (
    <div className="rounded-xl p-6 sm:p-8 bg-surface border border-border-theme">
      {showSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          Subscription updated successfully!
        </div>
      )}

      <div className="flex items-center gap-2 mb-5">
        {isPro ? (
          <Crown className="w-5 h-5 text-yellow-400" />
        ) : (
          <Zap className="w-5 h-5 text-text-muted" />
        )}
        <h2 className="text-lg font-semibold text-text-primary">{t('subscription.title')}</h2>
      </div>

      <div className="space-y-4">
        {/* Current plan */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">{t('subscription.currentPlan')}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isPro
              ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30'
              : 'bg-white/5 text-text-secondary border border-border-theme'
          }`}>
            {isPro ? t('subscription.pro') : t('subscription.basic')}
            {!isPro && <span className="ml-1 text-text-muted">({t('subscription.free')})</span>}
          </span>
        </div>

        {/* Status (pro users) */}
        {isPro && statusLabel && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{t('subscription.status')}</span>
            <span className="text-sm text-text-primary">{statusLabel}</span>
          </div>
        )}

        {/* Next billing (pro users) */}
        {isPro && subscriptionPeriodEnd && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{t('subscription.nextBilling')}</span>
            <span className="text-sm text-text-primary">
              {new Date(subscriptionPeriodEnd).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Audio usage */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            {audioLimit
              ? t('subscription.audioUsage', { used: audioUsedThisMonth, limit: audioLimit })
              : t('subscription.audioUsageUnlimited', { used: audioUsedThisMonth })}
          </span>
        </div>

        {/* Usage bar for basic users */}
        {audioLimit && (
          <div className="w-full bg-white/5 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                audioUsedThisMonth >= audioLimit ? 'bg-red-500' : 'bg-accent-purple'
              }`}
              style={{ width: `${Math.min((audioUsedThisMonth / audioLimit) * 100, 100)}%` }}
            />
          </div>
        )}

        <div className="border-t border-border-theme pt-4 flex flex-col sm:flex-row gap-3">
          {isPro ? (
            <button
              onClick={handleToggle}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-border-theme text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : t('subscription.downgradToBasic')}
            </button>
          ) : (
            <>
              <button
                onClick={handleToggle}
                disabled={loading}
                className="btn-primary px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Crown className="w-4 h-4" />
                {loading ? '...' : t('subscription.upgradeToPro')}
              </button>
              <Link
                href="/pricing"
                className="px-4 py-2.5 rounded-lg border border-border-theme text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors flex items-center gap-1"
              >
                {t('nav.pricing')}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
