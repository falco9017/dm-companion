'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, Minus, X, Crown, Lock } from 'lucide-react'
import ChatInterface from './ChatInterface'
import { useI18n } from '@/lib/i18n-context'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ChatPopupProps {
  campaignId: string
}

export default function ChatPopup({ campaignId }: ChatPopupProps) {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const { t } = useI18n()
  const { data: session } = useSession()
  const tier = session?.user?.subscriptionTier || 'basic'
  const isLocked = tier === 'basic'

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg md:hidden"
        title={t('chat.title')}
      >
        <MessageCircle className="w-6 h-6" />
        {isLocked && <Lock className="w-3 h-3 absolute top-1 right-1 text-primary-foreground/60" />}
      </Button>
    )
  }

  return (
    <div
      className={`fixed z-50 flex flex-col transition-all duration-200 md:hidden
        bottom-0 right-0
        w-full
        bg-card border border-border shadow-2xl
        ${minimized ? 'h-12 rounded-none' : 'h-[80vh]'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
        <span className="text-sm font-semibold flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          {t('chat.title')}
          {isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setMinimized(!minimized)}
            title={minimized ? 'Expand' : 'Minimize'}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => { setOpen(false); setMinimized(false) }}
            title={t('common.close')}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat body or locked overlay */}
      {!minimized && (
        isLocked ? (
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
        ) : (
          <div className="flex-1 min-h-0">
            <ChatInterface campaignId={campaignId} />
          </div>
        )
      )}
    </div>
  )
}
