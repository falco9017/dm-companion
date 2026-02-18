import { auth, signOut } from '@/lib/auth'
import { getUserProfile } from '@/actions/profile'
import { t, type Locale } from '@/lib/i18n'
import ProfileForm from './ProfileForm'
import BackButton from './BackButton'
import { EmailVerificationBanner } from '../EmailVerificationBanner'
import { LogOut } from 'lucide-react'

export default async function ProfilePage() {
  const session = await auth()
  const profile = await getUserProfile(session!.user.id)
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

      {/* Profile card */}
      <div className="rounded-xl p-6 sm:p-8 bg-surface border border-border-theme">
        <div className="flex items-center gap-4 mb-6">
          {profile.image && (
            <img
              src={profile.image}
              alt=""
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

        <ProfileForm
          userId={session!.user.id}
          name={profile.name || ''}
          uiLanguage={profile.uiLanguage}
        />
      </div>

      {/* Sign out */}
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
  )
}
