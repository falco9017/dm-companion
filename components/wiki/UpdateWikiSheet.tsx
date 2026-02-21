'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface UpdateWikiSheetProps {
  campaignId: string
  isOpen: boolean
  onClose: () => void
}

export default function UpdateWikiSheet({
  campaignId,
  isOpen,
  onClose,
}: UpdateWikiSheetProps) {
  const router = useRouter()
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ created: number; updated: number; deleted: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { t } = useI18n()

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/wiki/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          userInstructions: instructions.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setResult({ created: data.created, updated: data.updated, deleted: data.deleted || 0 })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setInstructions('')
    setResult(null)
    setError(null)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-primary" />
            </div>
            <SheetTitle>{t('updateWiki.title')}</SheetTitle>
          </div>
          <SheetDescription>{t('updateWiki.description')}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>{t('updateWiki.instructions')}</Label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={t('updateWiki.instructionsPlaceholder')}
              rows={3}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 text-sm">
              {t('updateWiki.done', { created: result.created, updated: result.updated, deleted: result.deleted })}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={handleClose} disabled={loading}>
              {result ? t('common.close') : t('common.cancel')}
            </Button>
            {!result && (
              <Button onClick={handleGenerate} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {loading ? t('updateWiki.analyzing') : t('updateWiki.generate')}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
