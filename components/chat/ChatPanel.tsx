'use client'

import { useState } from 'react'
import { MessageCircle, PanelRightClose, PanelRightOpen } from 'lucide-react'
import ChatInterface from './ChatInterface'
import { useI18n } from '@/lib/i18n-context'

interface ChatPanelProps {
  campaignId: string
}

export default function ChatPanel({ campaignId }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(true)
  const { t } = useI18n()

  if (!isOpen) {
    return (
      <div className="hidden md:flex flex-col items-center w-10 border-l border-border-theme bg-surface flex-shrink-0">
        <button
          onClick={() => setIsOpen(true)}
          className="mt-3 p-2 rounded-lg text-text-muted hover:text-accent-purple-light hover:bg-accent-purple/10 transition-colors"
          title={t('chat.openPanel')}
        >
          <MessageCircle className="w-5 h-5" />
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
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 text-text-muted hover:text-text-primary transition-colors"
          title={t('chat.closePanel')}
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Chat body */}
      <div className="flex-1 min-h-0">
        <ChatInterface campaignId={campaignId} />
      </div>
    </div>
  )
}
