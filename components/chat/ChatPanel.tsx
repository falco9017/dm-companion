'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { PanelRightClose, Crown, Lock, Maximize2, Minimize2 } from 'lucide-react'
import ChatInterface from './ChatInterface'
import { useI18n } from '@/lib/i18n-context'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function GeminiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z"
        fill="currentColor"
      />
    </svg>
  )
}

interface ChatPanelProps {
  campaignId: string
  isFullScreen?: boolean
  onFullScreenChange?: (fs: boolean) => void
}

const MIN_WIDTH = 260
const MAX_WIDTH = 800
const DEFAULT_WIDTH = 320

export default function ChatPanel({ campaignId, isFullScreen, onFullScreenChange }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH)
  const panelWidthRef = useRef(DEFAULT_WIDTH)
  const { t } = useI18n()
  const { data: session } = useSession()
  const tier = session?.user?.subscriptionTier || 'basic'
  const isLocked = tier === 'basic'

  useEffect(() => {
    panelWidthRef.current = panelWidth
  }, [panelWidth])

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = panelWidthRef.current

    const onMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX // drag left = expand
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta))
      setPanelWidth(newWidth)
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  if (!isOpen) {
    return (
      <div className="hidden md:flex flex-col items-center w-10 border-l border-border bg-card flex-shrink-0">
        <button
          onClick={() => setIsOpen(true)}
          className="mt-3 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors relative"
          title={t('chat.openPanel')}
        >
          <GeminiIcon className="w-5 h-5" />
          {isLocked && <Lock className="w-3 h-3 absolute -top-0.5 -right-0.5 text-muted-foreground" />}
        </button>
      </div>
    )
  }

  return (
    <div
      className={`hidden md:flex flex-col border-l border-border bg-card flex-shrink-0 relative ${isFullScreen ? 'flex-1' : ''}`}
      style={isFullScreen ? undefined : { width: panelWidth }}
    >
      {/* Drag handle */}
      {!isFullScreen && (
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-10 group/resize"
          onMouseDown={handleDragStart}
        >
          <div className="absolute inset-y-0 left-0 w-px bg-transparent group-hover/resize:bg-primary/50 transition-colors duration-150" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border flex-shrink-0">
        <span className="text-sm font-semibold flex items-center gap-2">
          <GeminiIcon className="w-4 h-4 text-primary" />
          {t('chat.title')}
          {isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onFullScreenChange?.(!isFullScreen)}
            title={isFullScreen ? t('chat.restorePanel') : t('chat.maximizePanel')}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              if (isFullScreen) onFullScreenChange?.(false)
              setIsOpen(false)
            }}
            title={t('chat.closePanel')}
          >
            <PanelRightClose className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat body or locked overlay */}
      {isLocked ? (
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
      )}
    </div>
  )
}
