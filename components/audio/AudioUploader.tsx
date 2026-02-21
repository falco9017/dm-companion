'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { upload } from '@vercel/blob/client'
import { Upload, Loader2, CheckCircle, AlertCircle, RefreshCw, Calendar, Send } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { useSession } from 'next-auth/react'
import { updateSessionRecapDate, updateSessionRecapContent, reviseRecap } from '@/actions/wiki'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

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
          if (data.recapEntryId) {
            if (pollingRef.current) clearInterval(pollingRef.current)
            const summaryText = data.summary ?? ''
            setSummary(summaryText)
            setRecapText(summaryText)
            setRecapEntryId(data.recapEntryId)
            setSessionDate(toDateInputValue(new Date(fileLastModified)))
            setStage('review')
          }
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
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="font-semibold">{t('audio.reviewTitle')}</p>
            <p className="text-muted-foreground text-xs">{t('audio.reviewSubtitle')}</p>
          </div>
        </div>

        {/* Date editor */}
        <div className="flex-shrink-0 space-y-1">
          <Label className="text-xs">
            <Calendar className="w-3 h-3 inline mr-1" />
            {t('audio.sessionDate')}
          </Label>
          <Input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            disabled={stage === 'updatingWiki'}
          />
        </div>

        {/* Editable recap textarea */}
        <div className="flex flex-col flex-1 min-h-0 space-y-1">
          <Label className="text-xs">{t('audio.recapLabel')}</Label>
          <Textarea
            value={recapText}
            onChange={(e) => setRecapText(e.target.value)}
            className="flex-1 min-h-0 resize-none leading-relaxed"
            disabled={stage === 'updatingWiki' || chatLoading}
          />
        </div>

        {/* AI revision chat bar */}
        <div className="flex-shrink-0">
          {chatError && (
            <p className="text-destructive text-xs mb-1">{chatError}</p>
          )}
          <div className="flex gap-2">
            <Input
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
              disabled={chatLoading || stage === 'updatingWiki'}
            />
            <Button
              variant="secondary"
              onClick={handleRevise}
              disabled={chatLoading || !chatInput.trim() || stage === 'updatingWiki'}
            >
              {chatLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  {t('audio.applying')}
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {t('audio.apply')}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Wiki update error */}
        {wikiError && (
          <div className="flex-shrink-0 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs">
            {wikiError}
          </div>
        )}

        {/* Done result */}
        {stage === 'done' && wikiResult && (
          <div className="flex-shrink-0 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs">
            {t('audio.wikiUpdated', { created: wikiResult.created, updated: wikiResult.updated })}
          </div>
        )}

        {/* Actions */}
        <div className="flex-shrink-0 flex justify-end gap-3">
          {stage === 'done' ? (
            <Button onClick={() => onClose?.()}>
              {t('common.close')}
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={stage === 'updatingWiki'}
              >
                {t('audio.skip')}
              </Button>
              <Button
                onClick={handleUpdateWiki}
                disabled={stage === 'updatingWiki'}
              >
                {stage === 'updatingWiki' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t('audio.updatingWiki')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('audio.updateWiki')}
                  </>
                )}
              </Button>
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
            ? 'border-border bg-card cursor-default'
            : isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-3">
          {stage === 'uploading' ? (
            <>
              <p className="font-semibold">{t('audio.uploading')} {progress}%</p>
              <div className="max-w-xs mx-auto bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : stage === 'creating' || stage === 'processing' ? (
            <>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <p className="font-semibold">
                  {stage === 'creating' ? t('audio.creating') : t('audio.processing')}
                </p>
              </div>
              <p className="text-muted-foreground text-xs">{t('audio.waitNote')}</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="font-semibold">
                {isDragActive ? t('audio.dropHere') : t('audio.dragDrop')}
              </p>
              {!isDragActive && (
                <>
                  <p className="text-muted-foreground text-sm">{t('audio.orBrowse')}</p>
                  <p className="text-muted-foreground text-xs">{t('audio.formats')}</p>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-destructive text-sm">{error}</p>
            <button
              onClick={() => { setError(null); setStage('idle') }}
              className="text-destructive/70 hover:text-destructive text-xs mt-1 underline"
            >
              {t('audio.tryAgain')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
