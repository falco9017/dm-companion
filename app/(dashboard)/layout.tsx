import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <nav className="bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/campaigns" className="text-2xl font-bold text-white">
                DM Companion
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-7 h-7 rounded-full"
                  />
                )}
                <span>{session.user.name || session.user.email}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
