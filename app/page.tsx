import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Mic, BookOpen, Sparkles, Check, X, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const session = await auth()
  if (session?.user) {
    redirect('/campaigns')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border">
        <span className="font-serif text-2xl font-medium text-primary tracking-wide">Mystic Quest</span>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-col items-center text-center px-6 py-20 md:py-32">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-muted-foreground text-sm mb-8">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          AI-powered campaign management
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-medium mb-6 leading-tight max-w-3xl">
          Your Campaign,{' '}
          <span className="gradient-text">Brought to Life</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          Upload session audio, auto-generate campaign wikis, track combat, and consult Mystic AI — your AI co-DM.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-20">
          <Button asChild size="lg" className="text-base px-8 font-medium">
            <Link href="/auth/signup">Start for Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base px-8">
            <a href="#pricing">View Pricing</a>
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
          <div className="bg-card border border-border rounded-2xl p-6 text-left hover:border-primary/50 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-serif text-lg font-medium mb-2">Session Audio</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Upload recordings and get instant transcriptions and AI summaries.</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-left hover:border-primary/50 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-serif text-lg font-medium mb-2">Campaign Wiki</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Characters, locations, and lore auto-generated and kept in sync.</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-left hover:border-primary/50 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-serif text-lg font-medium mb-2">Mystic AI</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Ask anything about your campaign or get AI-generated content on demand.</p>
          </div>
        </div>
      </main>

      {/* Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-medium mb-3">Choose Your Plan</h2>
          <p className="text-muted-foreground">Start free and upgrade when you need more power.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Basic */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <h3 className="font-serif text-2xl font-medium mb-1">Adventurer</h3>
            <p className="text-muted-foreground text-sm mb-6">For solo GMs getting started</p>
            <div className="mb-8">
              <span className="text-4xl font-bold">Free</span>
            </div>
            <ul className="space-y-3 mb-8">
              <PricingFeature text="1 campaign" />
              <PricingFeature text="1 audio transcription / month" />
              <PricingFeature text="Auto-generated wiki entries" />
              <PricingFeature text="D&D character sheets" />
              <PricingFeatureNo text="No Mystic AI chat" />
            </ul>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>

          {/* Pro */}
          <div className="bg-card border-2 border-primary rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
            </div>
            <h3 className="font-serif text-2xl font-medium mb-1">Legend</h3>
            <p className="text-muted-foreground text-sm mb-6">For serious campaign managers</p>
            <div className="mb-8">
              <span className="text-4xl font-bold">$6.99</span>
              <span className="text-muted-foreground text-sm ml-1">/ month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <PricingFeature text="Unlimited campaigns" />
              <PricingFeature text="Unlimited audio transcriptions" />
              <PricingFeature text="Auto-generated wiki entries" />
              <PricingFeature text="D&D character sheets" />
              <PricingFeature text="Mystic AI chat assistant" />
              <PricingFeature text="Priority support" />
            </ul>
            <Button asChild className="w-full">
              <Link href="/auth/signup">
                <Crown className="w-4 h-4 mr-2" />
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>
          <span className="font-serif text-foreground font-medium">Mystic Quest</span>
          {' '}· Built for Dungeon Masters & Players
        </p>
      </footer>
    </div>
  )
}

function PricingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-muted-foreground">
      <Check className="w-4 h-4 text-primary flex-shrink-0" />
      {text}
    </li>
  )
}

function PricingFeatureNo({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-muted-foreground opacity-50">
      <X className="w-4 h-4 flex-shrink-0" />
      {text}
    </li>
  )
}
