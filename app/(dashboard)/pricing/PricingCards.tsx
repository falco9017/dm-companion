'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-context'
import { toggleSubscription } from '@/actions/subscription'
import { Check, X, Crown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

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
        <span className={`text-sm ${!annual ? 'font-medium' : 'text-muted-foreground'}`}>
          {t('pricing.monthly')}
        </span>
        <Switch checked={annual} onCheckedChange={setAnnual} />
        <span className={`text-sm ${annual ? 'font-medium' : 'text-muted-foreground'}`}>
          {t('pricing.annual')}
        </span>
        {annual && (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            {t('pricing.saveBadge')}
          </Badge>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Basic card */}
        <Card className={!isPro ? 'border-primary/50' : ''}>
          <CardContent className="p-6 sm:p-8 flex flex-col h-full">
            <h3 className="text-xl font-bold mb-1">{t('pricing.basicName')}</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold">{t('pricing.basicPrice')}</span>
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
                <div className="w-full py-2.5 rounded-lg border border-primary/30 text-center text-sm font-medium text-primary">
                  {t('pricing.currentPlan')}
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleToggle}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? '...' : t('subscription.downgradToBasic')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pro card */}
        <Card className={`border-2 ${isPro ? 'border-yellow-400/50' : 'border-primary'}`}>
          <CardContent className="p-6 sm:p-8 flex flex-col h-full">
            <h3 className="text-xl font-bold mb-1">{t('pricing.proName')}</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold">
                {annual ? t('pricing.proAnnual') : t('pricing.proMonthly')}
              </span>
              <span className="text-muted-foreground text-sm ml-1">
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
                <div className="w-full py-2.5 rounded-lg border border-yellow-400/30 text-center text-sm font-medium text-yellow-500 dark:text-yellow-400">
                  {t('pricing.currentPlan')}
                </div>
              ) : (
                <Button
                  onClick={handleToggle}
                  disabled={loading}
                  className="w-full"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {loading ? '...' : t('pricing.subscribe')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-muted-foreground">
      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      {text}
    </li>
  )
}

function FeatureNo({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-muted-foreground opacity-60">
      <X className="w-4 h-4 flex-shrink-0" />
      {text}
    </li>
  )
}
