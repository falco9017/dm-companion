import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav user={session.user} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
