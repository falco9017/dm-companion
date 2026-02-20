'use client'

import AudioUploader from '@/components/audio/AudioUploader'
import { Mic } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'

interface AudioUploadModalProps {
  campaignId: string
  isOpen: boolean
  onClose: () => void
}

export default function AudioUploadModal({ campaignId, isOpen, onClose }: AudioUploadModalProps) {
  const { t } = useI18n()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-xl w-full max-w-4xl h-[90vh] mx-3 border border-border-theme flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border-theme flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
              <Mic className="w-4 h-4 text-accent-purple-light" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{t('audio.uploadTitle')}</h2>
              <p className="text-text-muted text-xs mt-0.5">
                {t('audio.uploadSubtitle')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xl transition-colors">&times;</button>
        </div>
        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <AudioUploader campaignId={campaignId} onClose={onClose} />
        </div>
      </div>
    </div>
  )
}
