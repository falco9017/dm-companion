'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, PanelRightClose, Crown, Lock } from 'lucide-react'
import ChatInterface from './ChatInterface'
import { useI18n } from '@/lib/i18n-context'
import Link from 'next/link'

interface ChatPanelProps {
  campaignId: string
}

export default function ChatPanel({ campaignId }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(true)
  const { t } = useI18n()
  const { data: session } = useSession()
  const tier = session?.user?.subscriptionTier || 'basic'
  const isLocked = tier === 'basic'

  if (!isOpen) {
    return (
      <div className="hidden md:flex flex-col items-center w-10 border-l border-border-theme bg-surface flex-shrink-0">
        <button
          onClick={() => setIsOpen(true)}
          className="mt-3 p-2 rounded-lg text-text-muted hover:text-accent-purple-light hover:bg-accent-purple/10 transition-colors relative"
          title={t('chat.openPanel')}
        >
          <MessageCircle className="w-5 h-5" />
          {isLocked && <Lock className="w-3 h-3 absolute -top-0.5 -right-0.5 text-text-muted" />}
        </button>
      </div>
    )
  }

  return (
    <div className="hidden md:flex flex-col w-80 border-l border-border-theme bg-surface flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-theme flex-shrink-0">
        <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-accent-purple-light" />
          {t('chat.title')}
          {isLocked && <Lock className="w-3 h-3 text-text-muted" />}
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 text-text-muted hover:text-text-primary transition-colors"
          title={t('chat.closePanel')}
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Chat body or locked overlay */}
      {isLocked ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-purple/10 flex items-center justify-center">
            <Crown className="w-6 h-6 text-accent-purple-light" />
          </div>
          <p className="text-sm text-text-secondary">{t('limits.chatLocked')}</p>
          <Link
            href="/pricing"
            className="btn-primary px-5 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            {t('limits.upgrade')}
          </Link>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ChatInterface campaignId={campaignId} />
        </div>
      )}
    </div>
  )
}
