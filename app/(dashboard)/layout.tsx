import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/actions/profile'
import { I18nProvider } from '@/lib/i18n-context'
import type { Locale } from '@/lib/i18n'
import DashboardNav from './DashboardNav'

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
  const locale = (profile.uiLanguage || 'en') as Locale

  return (
    <I18nProvider locale={locale}>
      <div className="min-h-screen bg-background flex flex-col">
        <DashboardNav user={session.user} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </I18nProvider>
  )
}
