'use client'

import { useState } from 'react'
import { MessageCircle, Minus, X } from 'lucide-react'
import ChatInterface from './ChatInterface'
import { useI18n } from '@/lib/i18n-context'

interface ChatPopupProps {
  campaignId: string
}

export default function ChatPopup({ campaignId }: ChatPopupProps) {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const { t } = useI18n()

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full btn-primary flex items-center justify-center shadow-lg md:hidden"
        title={t('chat.title')}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div
      className={`fixed z-50 flex flex-col transition-all duration-200 md:hidden
        bottom-0 right-0
        w-full
        bg-surface border border-border-theme shadow-2xl
        ${minimized ? 'h-12 rounded-none' : 'h-[80vh]'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-theme flex-shrink-0 md:rounded-t-xl">
        <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-accent-purple-light" />
          {t('chat.title')}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized(!minimized)}
            className="text-text-muted hover:text-text-primary p-1 transition-colors"
            title={minimized ? 'Expand' : 'Minimize'}
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setOpen(false); setMinimized(false) }}
            className="text-text-muted hover:text-text-primary p-1 transition-colors"
            title={t('common.close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat body */}
      {!minimized && (
        <div className="flex-1 min-h-0">
          <ChatInterface campaignId={campaignId} />
        </div>
      )}
    </div>
  )
}
