'use client'

import AudioUploader from '@/components/audio/AudioUploader'
import { Mic } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'

interface AudioUploadSheetProps {
  campaignId: string
  isOpen: boolean
  onClose: () => void
}

export default function AudioUploadSheet({ campaignId, isOpen, onClose }: AudioUploadSheetProps) {
  const { t } = useI18n()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-2xl flex flex-col">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary" />
            </div>
            <div>
              <SheetTitle>{t('audio.uploadTitle')}</SheetTitle>
              <SheetDescription>{t('audio.uploadSubtitle')}</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-hidden flex flex-col mt-4">
          <AudioUploader campaignId={campaignId} onClose={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
