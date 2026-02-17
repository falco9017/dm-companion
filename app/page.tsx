import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Scroll, Mic, BookOpen, MessageCircle } from 'lucide-react'

export default async function Home() {
  const session = await auth()
  if (session?.user) {
    redirect('/campaigns')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-glow">
      <main className="flex flex-col items-center gap-8 text-center px-6 py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent-purple/20 flex items-center justify-center mb-2">
            <Scroll className="w-8 h-8 text-accent-purple-light" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-text-primary tracking-tight text-glow">
            <span className="gradient-text">DM Companion</span>
          </h1>
          <p className="text-lg sm:text-2xl text-text-secondary font-medium">
            Your Ultimate Campaign Management Tool
          </p>
        </div>

        <div className="text-base sm:text-lg text-text-muted">
          For Dungeon Masters & Players
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mt-4">
          <div className="glass-card rounded-xl p-4 text-center">
            <Mic className="w-6 h-6 text-accent-purple-light mx-auto mb-2" />
            <p className="text-sm text-text-secondary">Upload & transcribe session audio</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <BookOpen className="w-6 h-6 text-accent-purple-light mx-auto mb-2" />
            <p className="text-sm text-text-secondary">Auto-generate campaign wiki</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <MessageCircle className="w-6 h-6 text-accent-purple-light mx-auto mb-2" />
            <p className="text-sm text-text-secondary">AI chat with campaign context</p>
          </div>
        </div>

        <Link
          href="/signin"
          className="btn-primary px-8 py-3.5 rounded-xl text-lg mt-4"
        >
          Get Started
        </Link>
      </main>
    </div>
  )
}
