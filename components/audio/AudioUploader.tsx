'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { upload } from '@vercel/blob/client'
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'

interface AudioUploaderProps {
  campaignId: string
}

type UploadStage = 'idle' | 'uploading' | 'creating' | 'processing' | 'done' | 'error'

export default function AudioUploader({ campaignId }: AudioUploaderProps) {
  const router = useRouter()
  const [stage, setStage] = useState<UploadStage>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { t } = useI18n()

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  const pollStatus = useCallback((audioFileId: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/audio/status?id=${audioFileId}`)
        if (!res.ok) return

        const data = await res.json()

        if (data.status === 'PROCESSED') {
          if (pollingRef.current) clearInterval(pollingRef.current)
          setStage('done')
          setTimeout(() => {
            router.refresh()
            setStage('idle')
            setProgress(0)
          }, 2000)
        } else if (data.status === 'FAILED') {
          if (pollingRef.current) clearInterval(pollingRef.current)
          setStage('error')
          setError(data.errorMessage || 'Processing failed')
        }
      } catch {
        // Keep polling on transient errors
      }
    }, 3000)
  }, [router])

  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
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

      pollStatus(audioFile.id)
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

  const isActive = stage !== 'idle' && stage !== 'error'

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
          ) : stage === 'done' ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <p className="text-success font-semibold">{t('audio.done')}</p>
            </div>
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
