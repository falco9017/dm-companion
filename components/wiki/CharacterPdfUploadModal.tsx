'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { FileText, Upload, Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'

interface CharacterPdfUploadModalProps {
  campaignId: string
  userId: string
  wikiEntryId: string
  wikiEntryTitle: string
  isOpen: boolean
  onClose: () => void
}

type Stage = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export default function CharacterPdfUploadModal({
  campaignId,
  wikiEntryId,
  wikiEntryTitle,
  isOpen,
  onClose,
}: CharacterPdfUploadModalProps) {
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

        // Navigate to the entry with the character sheet
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={stage === 'idle' || stage === 'error' ? onClose : undefined} />
      <div className="relative bg-surface rounded-xl w-full max-w-lg mx-3 border border-border-theme">
        <div className="flex items-center justify-between p-6 border-b border-border-theme">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{t('characterSheet.importTitle')}</h2>
              <p className="text-text-muted text-xs mt-0.5">
                {wikiEntryTitle
                  ? t('characterSheet.importForEntry', { name: wikiEntryTitle })
                  : t('characterSheet.importSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={stage === 'uploading' || stage === 'processing'}
            className="text-text-muted hover:text-text-primary text-xl transition-colors disabled:opacity-50"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          {stage === 'idle' || stage === 'error' ? (
            <>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-accent-purple bg-accent-purple/5'
                    : 'border-border-theme hover:border-accent-purple/40'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-secondary mb-1">
                  {isDragActive ? t('characterSheet.dropHere') : t('characterSheet.dragOrClick')}
                </p>
                <p className="text-xs text-text-muted">
                  {t('characterSheet.pdfOnly')}
                </p>
              </div>
              {stage === 'error' && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
            </>
          ) : stage === 'uploading' || stage === 'processing' ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-accent-purple-light mx-auto mb-3 animate-spin" />
              <p className="text-sm text-text-secondary">
                {stage === 'uploading'
                  ? t('characterSheet.uploading')
                  : t('characterSheet.processing')}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {t('characterSheet.aiParsing')}
              </p>
            </div>
          ) : stage === 'done' ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm text-text-primary font-semibold">
                {characterName ? `${characterName} imported!` : t('characterSheet.importSuccess')}
              </p>
              <p className="text-xs text-text-muted mt-1">{t('characterSheet.redirecting')}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
