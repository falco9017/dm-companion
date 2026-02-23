'use client'

import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { generateInviteCode } from '@/actions/campaigns'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n-context'

interface InviteCodePanelProps {
  campaignId: string
  userId: string
  initialCode: string | null | undefined
}

export default function InviteCodePanel({ campaignId, userId, initialCode }: InviteCodePanelProps) {
  const { t } = useI18n()
  const [code, setCode] = useState(initialCode ?? null)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const inviteUrl = code ? `${baseUrl}/join/${code}` : null

  async function handleGenerate() {
    setGenerating(true)
    try {
      const newCode = await generateInviteCode(campaignId, userId)
      setCode(newCode)
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 space-y-3 min-w-[280px]">
      <h3 className="font-semibold text-sm">{t('invite.shareTitle')}</h3>

      {code ? (
        <>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">{t('invite.code')}</p>
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted font-mono text-sm font-bold tracking-widest">
              {code}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground break-all">{inviteUrl}</p>
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-2"
              onClick={handleCopy}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('invite.copied') : t('invite.copyLink')}
            </Button>
          </div>

          <div className="border-t pt-3 space-y-1.5">
            <p className="text-xs text-muted-foreground">{t('invite.regenerateWarn')}</p>
            <Button
              size="sm"
              variant="ghost"
              className="w-full gap-2 text-muted-foreground"
              onClick={handleGenerate}
              disabled={generating}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              {t('invite.regenerate')}
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">No invite link yet.</p>
          <Button size="sm" className="w-full" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : t('invite.generate')}
          </Button>
        </div>
      )}
    </div>
  )
}
