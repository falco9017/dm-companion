'use client'

import AudioUploader from '@/components/audio/AudioUploader'
import { Mic } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface AudioUploadDialogProps {
  campaignId: string
  isOpen: boolean
  onClose: () => void
}

export default function AudioUploadDialog({ campaignId, isOpen, onClose }: AudioUploadDialogProps) {
  const { t } = useI18n()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle>{t('audio.uploadTitle')}</DialogTitle>
              <DialogDescription>{t('audio.uploadSubtitle')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col">
          <AudioUploader campaignId={campaignId} onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
