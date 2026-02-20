'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { upload } from '@vercel/blob/client'
import { Upload, Loader2, CheckCircle, AlertCircle, RefreshCw, Calendar, Send } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { useSession } from 'next-auth/react'
import { updateSessionRecapDate, updateSessionRecapContent, reviseRecap } from '@/actions/wiki'

interface AudioUploaderProps {
  campaignId: string
  onClose?: () => void
}

type UploadStage = 'idle' | 'uploading' | 'creating' | 'processing' | 'review' | 'updatingWiki' | 'done' | 'error'

function toDateInputValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function AudioUploader({ campaignId, onClose }: AudioUploaderProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [stage, setStage] = useState<UploadStage>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [recapText, setRecapText] = useState<string>('')
  const [recapEntryId, setRecapEntryId] = useState<string | null>(null)
  const [sessionDate, setSessionDate] = useState<string>('')
  const [wikiResult, setWikiResult] = useState<{ created: number; updated: number } | null>(null)
  const [wikiError, setWikiError] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { t } = useI18n()

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  const pollStatus = useCallback((audioFileId: string, fileLastModified: number) => {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/audio/status?id=${audioFileId}`)
        if (!res.ok) return

        const data = await res.json()

        if (data.status === 'PROCESSED') {
          // Only transition to review once the recap entry is created
          if (data.recapEntryId) {
            if (pollingRef.current) clearInterval(pollingRef.current)
            const summaryText = data.summary ?? ''
            setSummary(summaryText)
            setRecapText(summaryText)
            setRecapEntryId(data.recapEntryId)
            setSessionDate(toDateInputValue(new Date(fileLastModified)))
            setStage('review')
          }
          // else: keep polling — recap entry not yet written
        } else if (data.status === 'FAILED') {
          if (pollingRef.current) clearInterval(pollingRef.current)
          setStage('error')
          setError(data.errorMessage || 'Processing failed')
        }
      } catch {
        // Keep polling on transient errors
      }
    }, 3000)
  }, [])

  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    const fileLastModified = file.lastModified
    setStage('uploading')
    setError(null)
    setProgress(0)

    try {
      const timestamp = Date.now()
      const pathname = `${campaignId}/${timestamp}-${file.name}`

      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/audio/upload',
        onUploadProgress: (e) => {
          setProgress(Math.round(e.percentage))
        },
      })

      setStage('creating')
      const recordRes = await fetch('/api/audio/create-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          blobUrl: blob.url,
          blobPathname: blob.pathname,
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type || 'audio/mpeg',
          lastModifiedDate: new Date(fileLastModified).toISOString(),
        }),
      })

      if (!recordRes.ok) {
        const data = await recordRes.json()
        throw new Error(data.error || 'Failed to create record')
      }

      const { audioFile } = await recordRes.json()

      setStage('processing')
      const processRes = await fetch('/api/audio/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioFileId: audioFile.id }),
      })

      if (!processRes.ok) {
        const data = await processRes.json()
        throw new Error(data.error || 'Failed to start processing')
      }

      pollStatus(audioFile.id, fileLastModified)
    } catch (err) {
      setStage('error')
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
  }, [campaignId, pollStatus])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/mp4': ['.m4a'],
      'audio/ogg': ['.ogg'],
    },
    maxSize: 100 * 1024 * 1024,
    multiple: false,
    disabled: stage !== 'idle' && stage !== 'error',
    onDrop: handleDrop,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 100MB')
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload MP3, WAV, M4A, or OGG')
      } else {
        setError('File was rejected')
      }
    },
  })

  const saveDate = async () => {
    if (recapEntryId && session?.user?.id) {
      try {
        await updateSessionRecapDate(recapEntryId, session.user.id, sessionDate)
      } catch {
        // Non-fatal
      }
    }
  }

  const saveRecapContent = async () => {
    if (recapEntryId && session?.user?.id && recapText) {
      try {
        await updateSessionRecapContent(recapEntryId, session.user.id, recapText)
      } catch {
        // Non-fatal
      }
    }
  }

  const handleRevise = async () => {
    if (!chatInput.trim() || chatLoading) return
    setChatLoading(true)
    setChatError(null)
    try {
      const revised = await reviseRecap(recapText, chatInput)
      setRecapText(revised)
      setChatInput('')
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Revision failed')
    } finally {
      setChatLoading(false)
    }
  }

  const handleUpdateWiki = async () => {
    setStage('updatingWiki')
    setWikiError(null)
    await saveDate()
    await saveRecapContent()

    try {
      const res = await fetch('/api/wiki/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      setWikiResult({ created: data.created, updated: data.updated })
      setStage('done')
      router.refresh()
    } catch (err) {
      setWikiError(err instanceof Error ? err.message : 'Something went wrong')
      setStage('review')
    }
  }

  const handleSkip = async () => {
    await saveDate()
    await saveRecapContent()
    router.refresh()
    onClose?.()
  }

  const isActive = stage !== 'idle' && stage !== 'error'

  if (stage === 'review' || stage === 'updatingWiki' || stage === 'done') {
    return (
      <div className="flex flex-col h-full gap-4">
        {/* Header */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          <div>
            <p className="text-text-primary font-semibold">{t('audio.reviewTitle')}</p>
            <p className="text-text-muted text-xs">{t('audio.reviewSubtitle')}</p>
          </div>
        </div>

        {/* Date editor */}
        <div className="flex-shrink-0">
          <label className="block text-xs font-medium text-text-secondary mb-1">
            <Calendar className="w-3 h-3 inline mr-1" />
            {t('audio.sessionDate')}
          </label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg input-dark text-sm"
            disabled={stage === 'updatingWiki'}
          />
        </div>

        {/* Editable recap textarea */}
        <div className="flex flex-col flex-1 min-h-0">
          <label className="block text-xs font-medium text-text-secondary mb-1">
            {t('audio.recapLabel')}
          </label>
          <textarea
            value={recapText}
            onChange={(e) => setRecapText(e.target.value)}
            className="flex-1 min-h-0 w-full px-3 py-2 rounded-lg input-dark text-sm resize-none leading-relaxed"
            disabled={stage === 'updatingWiki' || chatLoading}
          />
        </div>

        {/* AI revision chat bar */}
        <div className="flex-shrink-0">
          {chatError && (
            <p className="text-red-400 text-xs mb-1">{chatError}</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !chatLoading) {
                  e.preventDefault()
                  handleRevise()
                }
              }}
              placeholder={t('audio.aiReviseHint')}
              className="flex-1 px-3 py-2 rounded-lg input-dark text-sm"
              disabled={chatLoading || stage === 'updatingWiki'}
            />
            <button
              onClick={handleRevise}
              disabled={chatLoading || !chatInput.trim() || stage === 'updatingWiki'}
              className="px-3 py-2 rounded-lg bg-accent-purple/20 text-accent-purple-light hover:bg-accent-purple/30 transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50 whitespace-nowrap"
            >
              {chatLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t('audio.applying')}
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {t('audio.apply')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Wiki update error */}
        {wikiError && (
          <div className="flex-shrink-0 p-3 bg-error/10 border border-error/20 rounded-lg text-red-400 text-xs">
            {wikiError}
          </div>
        )}

        {/* Done result */}
        {stage === 'done' && wikiResult && (
          <div className="flex-shrink-0 p-3 bg-success/10 border border-success/20 rounded-lg text-emerald-400 text-xs">
            {t('audio.wikiUpdated', { created: wikiResult.created, updated: wikiResult.updated })}
          </div>
        )}

        {/* Actions */}
        <div className="flex-shrink-0 flex justify-end gap-3">
          {stage === 'done' ? (
            <button
              onClick={() => onClose?.()}
              className="btn-primary px-4 py-2 text-sm rounded-lg"
            >
              {t('common.close')}
            </button>
          ) : (
            <>
              <button
                onClick={handleSkip}
                disabled={stage === 'updatingWiki'}
                className="px-4 py-2 text-sm rounded-lg text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
              >
                {t('audio.skip')}
              </button>
              <button
                onClick={handleUpdateWiki}
                disabled={stage === 'updatingWiki'}
                className="btn-primary px-4 py-2 text-sm rounded-lg flex items-center gap-2"
              >
                {stage === 'updatingWiki' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('audio.updatingWiki')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {t('audio.updateWiki')}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isActive
            ? 'border-border-theme bg-surface cursor-default'
            : isDragActive
              ? 'border-accent-purple bg-accent-purple/5'
              : 'border-border-theme bg-white/[0.02] hover:bg-white/[0.04] hover:border-accent-purple/50 cursor-pointer'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-3">
          {stage === 'uploading' ? (
            <>
              <p className="text-text-primary font-semibold">{t('audio.uploading')} {progress}%</p>
              <div className="max-w-xs mx-auto bg-surface rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-purple-light))',
                  }}
                />
              </div>
            </>
          ) : stage === 'creating' || stage === 'processing' ? (
            <>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 text-accent-purple-light animate-spin" />
                <p className="text-text-primary font-semibold">
                  {stage === 'creating' ? t('audio.creating') : t('audio.processing')}
                </p>
              </div>
              <p className="text-text-muted text-xs">{t('audio.waitNote')}</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-text-muted mx-auto" />
              <p className="text-text-primary font-semibold">
                {isDragActive ? t('audio.dropHere') : t('audio.dragDrop')}
              </p>
              {!isDragActive && (
                <>
                  <p className="text-text-secondary text-sm">{t('audio.orBrowse')}</p>
                  <p className="text-text-muted text-xs">{t('audio.formats')}</p>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => { setError(null); setStage('idle') }}
              className="text-red-400/70 hover:text-red-400 text-xs mt-1 underline"
            >
              {t('audio.tryAgain')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
