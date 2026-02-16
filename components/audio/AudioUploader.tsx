'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { upload } from '@vercel/blob/client'

interface AudioUploaderProps {
  campaignId: string
}

type UploadStage = 'idle' | 'uploading' | 'creating' | 'processing' | 'done' | 'error'

const stageMessages: Record<UploadStage, string> = {
  idle: '',
  uploading: 'Uploading file...',
  creating: 'Creating record...',
  processing: 'Processing audio (transcribing, summarizing, generating wiki entries)...',
  done: 'Done! Wiki entries generated.',
  error: 'Something went wrong.',
}

export default function AudioUploader({ campaignId }: AudioUploaderProps) {
  const router = useRouter()
  const [stage, setStage] = useState<UploadStage>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
      // 1. Upload to Vercel Blob
      const timestamp = Date.now()
      const pathname = `${campaignId}/${timestamp}-${file.name}`

      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/audio/upload',
        onUploadProgress: (e) => {
          setProgress(Math.round(e.percentage))
        },
      })

      // 2. Create DB record directly
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

      // 3. Kick off processing
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

      // 4. Poll for completion
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
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isActive
            ? 'border-gray-600 bg-gray-800/50 cursor-default'
            : isDragActive
              ? 'border-blue-400 bg-blue-500/10'
              : 'border-gray-600 bg-gray-800/30 hover:bg-gray-800/50 cursor-pointer'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-3">
          {stage === 'uploading' ? (
            <>
              <p className="text-white font-semibold">Uploading... {progress}%</p>
              <div className="max-w-xs mx-auto bg-gray-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : stage === 'creating' || stage === 'processing' ? (
            <>
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-white font-semibold">{stageMessages[stage]}</p>
              </div>
              <p className="text-gray-400 text-xs">This may take a few minutes for longer recordings</p>
            </>
          ) : stage === 'done' ? (
            <p className="text-green-400 font-semibold">{stageMessages.done}</p>
          ) : (
            <>
              <p className="text-white font-semibold">
                {isDragActive ? 'Drop the file here' : 'Drag & drop an audio file here'}
              </p>
              {!isDragActive && (
                <>
                  <p className="text-gray-400 text-sm">or click to browse</p>
                  <p className="text-gray-500 text-xs">MP3, WAV, M4A, OGG (max 100MB)</p>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={() => { setError(null); setStage('idle') }}
            className="text-red-400 hover:text-red-300 text-xs mt-1 underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
