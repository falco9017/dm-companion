'use client'

import WikiEntryForm from './WikiEntryForm'
import { useI18n } from '@/lib/i18n-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CreateEntryDialogProps {
  campaignId: string
  userId: string
  isOpen: boolean
  onClose: () => void
}

export default function CreateEntryDialog({ campaignId, userId, isOpen, onClose }: CreateEntryDialogProps) {
  const { t } = useI18n()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('wiki.createEntry')}</DialogTitle>
        </DialogHeader>
        <WikiEntryForm
          campaignId={campaignId}
          userId={userId}
          onDone={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
