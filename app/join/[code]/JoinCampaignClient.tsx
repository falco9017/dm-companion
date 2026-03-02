'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { joinCampaignByCode } from '@/actions/campaigns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users } from 'lucide-react'

interface Props {
  code: string
  campaignName: string
  dmName: string | null
  userId: string
  userName: string
}

export default function JoinCampaignClient({ code, campaignName, dmName, userId, userName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleJoin() {
    setLoading(true)
    setError(null)
    try {
      const result = await joinCampaignByCode(code, userId)
      if (result.error) {
        setError(result.error)
      } else if (result.campaignId) {
        router.push(`/campaigns/${result.campaignId}`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-medium font-serif">Campaign Invite</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{campaignName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dmName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Hosted by <span className="font-medium text-foreground">{dmName}</span></span>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Joining as <span className="font-medium text-foreground">{userName}</span>
            </p>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button onClick={handleJoin} disabled={loading} className="w-full">
              {loading ? 'Joining...' : 'Join Campaign'}
            </Button>

            <div className="text-center">
              <Link href="/campaigns" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Go to my campaigns instead
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
