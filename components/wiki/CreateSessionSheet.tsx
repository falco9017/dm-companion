'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSessionEntry } from '@/actions/wiki'
import { useI18n } from '@/lib/i18n-context'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface CreateSessionSheetProps {
  campaignId: string
  userId: string
  isOpen: boolean
  onClose: () => void
}

export default function CreateSessionSheet({ campaignId, userId, isOpen, onClose }: CreateSessionSheetProps) {
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t('session.createTitle')}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
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
      </SheetContent>
    </Sheet>
  )
}
