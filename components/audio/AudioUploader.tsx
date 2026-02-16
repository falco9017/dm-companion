'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { upload } from '@vercel/blob/client'

interface AudioUploaderProps {
  campaignId: string
}

export default function AudioUploader({ campaignId }: AudioUploaderProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/mp4': ['.m4a'],
      'audio/ogg': ['.ogg'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setUploading(true)
      setError(null)
      setProgress(0)

      try {
        const timestamp = Date.now()
        const pathname = `${campaignId}/${timestamp}-${file.name}`

        await upload(pathname, file, {
          access: 'public',
          handleUploadUrl: '/api/audio/upload',
          onUploadProgress: (e) => {
            setProgress(Math.round(e.percentage))
          },
        })

        setProgress(100)
        setTimeout(() => {
          router.push(`/campaigns/${campaignId}/audio`)
          router.refresh()
        }, 500)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
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

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-purple-400 bg-purple-500/20'
            : 'border-purple-500/30 bg-white/5 hover:bg-white/10'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-6xl">🎵</div>
          {uploading ? (
            <>
              <p className="text-white font-semibold">Uploading... {progress}%</p>
              <div className="max-w-xs mx-auto bg-black/30 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : isDragActive ? (
            <p className="text-white font-semibold">Drop the file here</p>
          ) : (
            <>
              <p className="text-white font-semibold">
                Drag & drop an audio file here
              </p>
              <p className="text-slate-400 text-sm">
                or click to browse
              </p>
              <p className="text-slate-500 text-xs">
                MP3, WAV, M4A, OGG (max 100MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
