'use client'

import { useState, useRef, useCallback } from 'react'
import { Mic, Square, Play, Pause, Upload, RotateCcw } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void
  disabled?: boolean
}

export default function VoiceRecorder({ onRecordingComplete, disabled }: VoiceRecorderProps) {
  const { t } = useI18n()
  const [state, setState] = useState<'idle' | 'recording' | 'recorded'>('idle')
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordedBlobRef = useRef<Blob | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        recordedBlobRef.current = blob

        // Create audio element for playback
        const url = URL.createObjectURL(blob)
        audioRef.current = new Audio(url)
        audioRef.current.onended = () => setIsPlaying(false)

        setState('recorded')
      }

      mediaRecorder.start(100)
      setState('recording')
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration((d) => {
          // Auto-stop at 30 seconds
          if (d >= 29) {
            mediaRecorderRef.current?.stop()
            if (timerRef.current) clearInterval(timerRef.current)
            return 30
          }
          return d + 1
        })
      }, 1000)
    } catch {
      // Microphone access denied or not available
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.currentTime = 0
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  const reset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      URL.revokeObjectURL(audioRef.current.src)
      audioRef.current = null
    }
    recordedBlobRef.current = null
    setIsPlaying(false)
    setDuration(0)
    setState('idle')
  }, [])

  const confirm = useCallback(() => {
    if (recordedBlobRef.current) {
      onRecordingComplete(recordedBlobRef.current)
      reset()
    }
  }, [onRecordingComplete, reset])

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      onRecordingComplete(file)
      e.target.value = ''
    },
    [onRecordingComplete]
  )

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-3">
      {state === 'idle' && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors text-sm disabled:opacity-50"
          >
            <Mic className="w-4 h-4" />
            {t('voiceProfiles.record')}
          </button>
          <span className="text-text-muted text-xs">{t('voiceProfiles.or')}</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-theme transition-colors text-sm disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {t('voiceProfiles.uploadFile')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {state === 'recording' && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            {t('voiceProfiles.stopRecording')}
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-text-secondary font-mono">{formatTime(duration)}</span>
          </div>
          <span className="text-xs text-text-muted">{t('voiceProfiles.maxDuration')}</span>
        </div>
      )}

      {state === 'recorded' && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlayback}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-theme transition-colors text-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {formatTime(duration)}
          </button>
          <button
            type="button"
            onClick={reset}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary transition-colors"
            title={t('voiceProfiles.reRecord')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={disabled}
            className="btn-primary px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {t('voiceProfiles.useRecording')}
          </button>
        </div>
      )}

      {state === 'idle' && (
        <p className="text-xs text-text-muted">{t('voiceProfiles.recordingHint')}</p>
      )}
    </div>
  )
}
