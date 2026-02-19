import { auth } from '@/lib/auth'
import { getUserProfile } from '@/actions/profile'
import { getEffectiveTier } from '@/lib/subscription'
import { t, type Locale } from '@/lib/i18n'
import PricingCards from './PricingCards'

export default async function PricingPage() {
  const session = await auth()
  const [profile, currentTier] = await Promise.all([
    getUserProfile(session!.user.id),
    getEffectiveTier(session!.user.id),
  ])
  const locale = (profile.uiLanguage === 'it' ? 'it' : 'en') as Locale

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary text-glow mb-3">
          {t(locale, 'pricing.title')}
        </h1>
        <p className="text-text-secondary text-lg">{t(locale, 'pricing.subtitle')}</p>
      </div>
      <PricingCards
        userId={session!.user.id}
        currentTier={currentTier}
      />
    </div>
  )
}
