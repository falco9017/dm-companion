'use client'

import { useSession } from 'next-auth/react'
import { Crown } from 'lucide-react'
import ChatInterface from '@/components/chat/ChatInterface'
import { useI18n } from '@/lib/i18n-context'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ChatViewProps {
  campaignId: string
}

export default function ChatView({ campaignId }: ChatViewProps) {
  const { t } = useI18n()
  const { data: session } = useSession()
  const tier = session?.user?.subscriptionTier || 'basic'
  const isLocked = tier === 'basic'

  if (isLocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Crown className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">{t('limits.chatLocked')}</p>
        <Button asChild>
          <Link href="/pricing">
            <Crown className="w-4 h-4 mr-2" />
            {t('limits.upgrade')}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0">
      <ChatInterface campaignId={campaignId} />
    </div>
  )
}
