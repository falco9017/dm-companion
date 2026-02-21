'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { FileText, Upload, Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'

interface CharacterPdfUploadSheetProps {
  campaignId: string
  userId: string
  wikiEntryId: string
  wikiEntryTitle: string
  isOpen: boolean
  onClose: () => void
}

type Stage = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export default function CharacterPdfUploadSheet({
  campaignId,
  wikiEntryId,
  wikiEntryTitle,
  isOpen,
  onClose,
}: CharacterPdfUploadSheetProps) {
  const [stage, setStage] = useState<Stage>('idle')
  const [error, setError] = useState('')
  const [characterName, setCharacterName] = useState('')
  const router = useRouter()
  const { t } = useI18n()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setStage('uploading')
      setError('')

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('campaignId', campaignId)
        if (wikiEntryId) {
          formData.append('wikiEntryId', wikiEntryId)
        }

        setStage('processing')
        const response = await fetch('/api/character-sheet/process', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Processing failed')
        }

        const result = await response.json()
        setCharacterName(result.characterName)
        setStage('done')

        setTimeout(() => {
          router.push(`/campaigns/${campaignId}?entry=${result.wikiEntryId}`)
          router.refresh()
          onClose()
          setStage('idle')
        }, 1500)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
        setStage('error')
      }
    },
    [campaignId, wikiEntryId, router, onClose]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: stage === 'uploading' || stage === 'processing',
  })

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open && (stage === 'idle' || stage === 'error')) onClose()
    }}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <SheetTitle>{t('characterSheet.importTitle')}</SheetTitle>
              <SheetDescription>
                {wikiEntryTitle
                  ? t('characterSheet.importForEntry', { name: wikiEntryTitle })
                  : t('characterSheet.importSubtitle')}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6">
          {stage === 'idle' || stage === 'error' ? (
            <>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-foreground mb-1">
                  {isDragActive ? t('characterSheet.dropHere') : t('characterSheet.dragOrClick')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('characterSheet.pdfOnly')}
                </p>
              </div>
              {stage === 'error' && (
                <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}
            </>
          ) : stage === 'uploading' || stage === 'processing' ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
              <p className="text-sm">
                {stage === 'uploading'
                  ? t('characterSheet.uploading')
                  : t('characterSheet.processing')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('characterSheet.aiParsing')}
              </p>
            </div>
          ) : stage === 'done' ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold">
                {characterName ? `${characterName} imported!` : t('characterSheet.importSuccess')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t('characterSheet.redirecting')}</p>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
