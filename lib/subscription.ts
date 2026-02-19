import { prisma } from './db'

export type SubscriptionTier = 'basic' | 'pro'

export const TIER_LIMITS = {
  basic: {
    maxCampaigns: 1,
    maxAudioPerMonth: 1,
    maxAudioDurationSec: 3600, // 1 hour
    chatEnabled: false,
  },
  pro: {
    maxCampaigns: Infinity,
    maxAudioPerMonth: Infinity,
    maxAudioDurationSec: Infinity,
    chatEnabled: true,
  },
} as const

export function getLimits(tier: SubscriptionTier) {
  return TIER_LIMITS[tier] || TIER_LIMITS.basic
}

/**
 * Authoritative tier check from DB (not JWT).
 * Handles grace period: if subscription is canceled but periodEnd hasn't passed, still pro.
 */
export async function getEffectiveTier(userId: string): Promise<SubscriptionTier> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionPeriodEnd: true,
    },
  })

  if (!user) return 'basic'

  if (user.subscriptionTier === 'pro') {
    // Active or trialing = pro
    if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') {
      return 'pro'
    }
    // Canceled but still within grace period
    if (
      user.subscriptionStatus === 'canceled' &&
      user.subscriptionPeriodEnd &&
      user.subscriptionPeriodEnd > new Date()
    ) {
      return 'pro'
    }
    // Past due — still allow for now (Stripe will handle retries)
    if (user.subscriptionStatus === 'past_due') {
      return 'pro'
    }
  }

  return 'basic'
}

/**
 * Lazy-resets monthly counter if audioQuotaResetAt is in the past, then returns current count.
 */
export async function getAudioUsageThisMonth(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { audioTranscriptionsThisMonth: true, audioQuotaResetAt: true },
  })

  if (!user) return 0

  // If reset date has passed, reset the counter
  if (user.audioQuotaResetAt < new Date()) {
    const nextReset = new Date()
    nextReset.setMonth(nextReset.getMonth() + 1)
    nextReset.setDate(1)
    nextReset.setHours(0, 0, 0, 0)

    await prisma.user.update({
      where: { id: userId },
      data: {
        audioTranscriptionsThisMonth: 0,
        audioQuotaResetAt: nextReset,
      },
    })
    return 0
  }

  return user.audioTranscriptionsThisMonth
}

export async function incrementAudioUsage(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      audioTranscriptionsThisMonth: { increment: 1 },
    },
  })
}

export async function canCreateCampaign(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const tier = await getEffectiveTier(userId)
  const limits = getLimits(tier)

  if (limits.maxCampaigns === Infinity) return { allowed: true }

  const count = await prisma.campaign.count({
    where: { ownerId: userId },
  })

  if (count >= limits.maxCampaigns) {
    return { allowed: false, reason: 'campaign_limit_reached' }
  }

  return { allowed: true }
}

export async function canProcessAudio(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const tier = await getEffectiveTier(userId)
  const limits = getLimits(tier)

  if (limits.maxAudioPerMonth === Infinity) return { allowed: true }

  const usage = await getAudioUsageThisMonth(userId)

  if (usage >= limits.maxAudioPerMonth) {
    return { allowed: false, reason: 'audio_limit_reached' }
  }

  return { allowed: true }
}

export async function canUseChat(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const tier = await getEffectiveTier(userId)
  const limits = getLimits(tier)

  if (!limits.chatEnabled) {
    return { allowed: false, reason: 'chat_locked' }
  }

  return { allowed: true }
}
