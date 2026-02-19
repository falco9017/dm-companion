import { auth, signOut } from '@/lib/auth'
import { getUserProfile } from '@/actions/profile'
import { getEffectiveTier } from '@/lib/subscription'
import { t, type Locale } from '@/lib/i18n'
import SettingsForm from './SettingsForm'
import ChangePasswordForm from './ChangePasswordForm'
import SubscriptionSection from './SubscriptionSection'
import BackButton from './BackButton'
import { EmailVerificationBanner } from '../EmailVerificationBanner'
import { LogOut } from 'lucide-react'
import Image from 'next/image'

export default async function ProfilePage() {
  const session = await auth()
  const [profile, effectiveTier] = await Promise.all([
    getUserProfile(session!.user.id),
    getEffectiveTier(session!.user.id),
  ])
  const locale = (profile.uiLanguage === 'it' ? 'it' : 'en') as Locale

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/signin' })
  }

  const showEmailBanner = !profile.emailVerified && !!profile.password

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {showEmailBanner && (
        <EmailVerificationBanner email={profile.email} />
      )}
      <div>
        <BackButton />
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary text-glow">{t(locale, 'profile.title')}</h1>
      </div>

      {/* Profile header card */}
      <div className="rounded-xl p-6 sm:p-8 bg-surface border border-border-theme">
        <div className="flex items-center gap-4">
          {profile.image && (
            <Image
              src={profile.image}
              alt=""
              width={64}
              height={64}
              className="w-16 h-16 rounded-full ring-2 ring-accent-purple/30"
            />
          )}
          <div>
            <p className="text-lg font-semibold text-text-primary">{profile.name || t(locale, 'profile.noName')}</p>
            <p className="text-sm text-text-secondary">{profile.email}</p>
            <p className="text-xs text-text-muted mt-1">
              {t(locale, 'profile.memberSince')} {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Settings section */}
      <div className="rounded-xl p-6 sm:p-8 bg-surface border border-border-theme">
        <h2 className="text-lg font-semibold text-text-primary mb-5">{t(locale, 'profile.settings')}</h2>
        <SettingsForm
          userId={session!.user.id}
          name={profile.name || ''}
          uiLanguage={profile.uiLanguage}
          dateFormat={profile.dateFormat}
        />
      </div>

      {/* Account section */}
      <div className="rounded-xl p-6 sm:p-8 bg-surface border border-border-theme space-y-6">
        <h2 className="text-lg font-semibold text-text-primary">{t(locale, 'profile.account')}</h2>

        {/* Current plan */}
        <SubscriptionSection
          userId={session!.user.id}
          subscriptionTier={effectiveTier}
          subscriptionStatus={profile.subscriptionStatus || null}
        />

        {/* Change password (credentials users only) */}
        {profile.password && (
          <div className="border-t border-border-theme pt-5">
            <h3 className="text-sm font-semibold text-text-secondary mb-4">Change password</h3>
            <ChangePasswordForm />
          </div>
        )}

        {/* Sign out */}
        <div className="border-t border-border-theme pt-5">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-lg border border-border-theme text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t(locale, 'nav.signOut')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
