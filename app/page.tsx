import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Scroll, Mic, BookOpen, MessageCircle, Check, X, Crown } from 'lucide-react'

export default async function Home() {
  const session = await auth()
  if (session?.user) {
    redirect('/campaigns')
  }

  return (
    <div className="min-h-screen bg-radial-glow">
      {/* Hero */}
      <main className="flex flex-col items-center gap-8 text-center px-6 py-12 sm:py-20">
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

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Link
            href="/signin"
            className="btn-primary px-8 py-3.5 rounded-xl text-lg"
          >
            Get Started
          </Link>
          <a
            href="#pricing"
            className="px-8 py-3.5 rounded-xl text-lg border border-border-theme text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            View Pricing
          </a>
        </div>
      </main>

      {/* Pricing section */}
      <section id="pricing" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary text-glow mb-3">
            Choose Your Plan
          </h2>
          <p className="text-text-secondary text-lg">Start free and upgrade when you need more power.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Basic */}
          <div className="rounded-xl p-6 sm:p-8 bg-surface border border-border-theme">
            <h3 className="text-xl font-bold text-text-primary mb-1">Basic</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold text-text-primary">Free</span>
            </div>
            <ul className="space-y-3 mb-8">
              <PricingFeature text="1 campaign" />
              <PricingFeature text="1 audio transcription/month" />
              <PricingFeature text="Wiki auto-generation" />
              <PricingFeature text="Character sheets" />
              <PricingFeatureNo text="No AI chat" />
            </ul>
            <Link
              href="/signin"
              className="block w-full py-2.5 rounded-lg border border-border-theme text-center text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-xl p-6 sm:p-8 bg-surface border-2 border-accent-purple relative">
            <h3 className="text-xl font-bold text-text-primary mb-1">Pro</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold text-text-primary">$6.99</span>
              <span className="text-text-muted text-sm ml-1">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <PricingFeature text="Unlimited campaigns" />
              <PricingFeature text="Unlimited audio transcriptions" />
              <PricingFeature text="Wiki auto-generation" />
              <PricingFeature text="Character sheets" />
              <PricingFeature text="AI chat assistant" />
              <PricingFeature text="Priority support" />
            </ul>
            <Link
              href="/signin"
              className="block w-full btn-primary py-2.5 rounded-lg text-center text-sm font-medium"
            >
              <span className="flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />
                Get Started
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function PricingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-text-secondary">
      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
      {text}
    </li>
  )
}

function PricingFeatureNo({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-text-muted">
      <X className="w-4 h-4 text-text-muted flex-shrink-0" />
      {text}
    </li>
  )
}
