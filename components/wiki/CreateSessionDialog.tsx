'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSessionEntry } from '@/actions/wiki'
import { useI18n } from '@/lib/i18n-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface CreateSessionDialogProps {
  campaignId: string
  userId: string
  isOpen: boolean
  onClose: () => void
}

export default function CreateSessionDialog({ campaignId, userId, isOpen, onClose }: CreateSessionDialogProps) {
  const router = useRouter()
  const { t } = useI18n()
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      await createSessionEntry(campaignId, userId, date, title || undefined)
      router.refresh()
      setTitle('')
      setDate(new Date().toISOString().split('T')[0])
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create session')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('session.createTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionDate">{t('session.date')} *</Label>
            <Input
              type="date"
              id="sessionDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sessionTitle">{t('session.title')}</Label>
            <Input
              type="text"
              id="sessionTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('session.titlePlaceholder')}
            />
          </div>
          <Button type="submit" disabled={creating} className="w-full">
            {creating ? t('common.creating') : t('session.create')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
