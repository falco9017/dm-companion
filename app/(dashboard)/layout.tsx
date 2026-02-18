import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/actions/profile'
import { I18nProvider } from '@/lib/i18n-context'
import type { Locale } from '@/lib/i18n'
import DashboardNav from './DashboardNav'
import { EmailVerificationBanner } from './EmailVerificationBanner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/signin')
  }

  const profile = await getUserProfile(session.user.id)
  const locale = (profile.uiLanguage === 'it' ? 'it' : 'en') as Locale
  const showEmailBanner = !profile.emailVerified

  return (
    <I18nProvider locale={locale}>
      <div className="min-h-screen bg-background flex flex-col">
        <DashboardNav user={session.user} />
        {showEmailBanner && <EmailVerificationBanner email={profile.email} />}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </I18nProvider>
  )
}
