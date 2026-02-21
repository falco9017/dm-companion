import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Scroll, Mic, BookOpen, MessageCircle, Check, X, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-2">
            <Scroll className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            <span className="gradient-text">DM Companion</span>
          </h1>
          <p className="text-lg sm:text-2xl text-muted-foreground font-medium">
            Your Ultimate Campaign Management Tool
          </p>
        </div>

        <div className="text-base sm:text-lg text-muted-foreground">
          For Dungeon Masters & Players
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mt-4">
          <Card className="hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <Mic className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Upload & transcribe session audio</p>
            </CardContent>
          </Card>
          <Card className="hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Auto-generate campaign data</p>
            </CardContent>
          </Card>
          <Card className="hover:-translate-y-0.5 hover:shadow-lg transition-all">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">AI chat with campaign context</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/signin">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <a href="#pricing">View Pricing</a>
          </Button>
        </div>
      </main>

      {/* Pricing section */}
      <section id="pricing" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground text-lg">Start free and upgrade when you need more power.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Basic */}
          <Card>
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl font-bold mb-1">Basic</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">Free</span>
              </div>
              <ul className="space-y-3 mb-8">
                <PricingFeature text="1 campaign" />
                <PricingFeature text="1 audio transcription/month" />
                <PricingFeature text="Entry auto-generation" />
                <PricingFeature text="Character sheets" />
                <PricingFeatureNo text="No AI chat" />
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/signin">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="border-2 border-primary relative">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl font-bold mb-1">Pro</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">$6.99</span>
                <span className="text-muted-foreground text-sm ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <PricingFeature text="Unlimited campaigns" />
                <PricingFeature text="Unlimited audio transcriptions" />
                <PricingFeature text="Entry auto-generation" />
                <PricingFeature text="Character sheets" />
                <PricingFeature text="AI chat assistant" />
                <PricingFeature text="Priority support" />
              </ul>
              <Button asChild className="w-full">
                <Link href="/signin">
                  <Crown className="w-4 h-4 mr-2" />
                  Get Started
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function PricingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-muted-foreground">
      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      {text}
    </li>
  )
}

function PricingFeatureNo({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-muted-foreground opacity-60">
      <X className="w-4 h-4 flex-shrink-0" />
      {text}
    </li>
  )
}
