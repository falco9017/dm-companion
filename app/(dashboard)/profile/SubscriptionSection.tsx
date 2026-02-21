'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-context'
import { toggleSubscription } from '@/actions/subscription'
import { Crown, Zap, ArrowRight, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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
            <Zap className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">{t('subscription.currentPlan')}</span>
          <Badge variant={isPro ? 'default' : 'secondary'} className={isPro ? 'bg-yellow-400/10 text-yellow-500 dark:text-yellow-400 border-yellow-400/30' : ''}>
            {isPro ? t('subscription.pro') : t('subscription.basic')}
          </Badge>
          {isPro && subscriptionStatus && (
            <span className="text-xs text-muted-foreground">({t(`subscription.${subscriptionStatus}` as string)})</span>
          )}
        </div>

        {isPro ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDowngradeClick}
            disabled={loading}
          >
            {loading ? '...' : t('subscription.downgradToBasic')}
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link href="/pricing">
              <Crown className="w-3 h-3 mr-1" />
              {t('subscription.upgradeToPro')}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        )}
      </div>

      {/* Downgrade warning dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              {t('limits.downgradeWarningTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('limits.downgradeWarningBody')
                .replace('{count}', String(campaignCount))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('limits.keepPro')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDowngrade}
              disabled={loading}
              className="bg-orange-500/10 text-orange-600 dark:text-orange-300 hover:bg-orange-500/20 border border-orange-500/30"
            >
              {loading ? '...' : t('limits.downgradeConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
