'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSessionEntry } from '@/actions/wiki'
import { useI18n } from '@/lib/i18n-context'

interface CreateSessionModalProps {
  campaignId: string
  userId: string
  isOpen: boolean
  onClose: () => void
}

export default function CreateSessionModal({ campaignId, userId, isOpen, onClose }: CreateSessionModalProps) {
  const router = useRouter()
  const { t } = useI18n()
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)

  if (!isOpen) return null

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
      alert(err instanceof Error ? err.message : 'Failed to create session')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-xl w-full max-w-md mx-3 bg-surface border border-border-theme">
        <div className="flex items-center justify-between p-6 border-b border-border-theme">
          <h2 className="text-xl font-bold text-text-primary">{t('session.createTitle')}</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-xl transition-colors"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="sessionDate" className="block text-sm font-medium text-text-secondary mb-1">
              {t('session.date')} *
            </label>
            <input
              type="date"
              id="sessionDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg input-dark"
            />
          </div>
          <div>
            <label htmlFor="sessionTitle" className="block text-sm font-medium text-text-secondary mb-1">
              {t('session.title')}
            </label>
            <input
              type="text"
              id="sessionTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('session.titlePlaceholder')}
              className="w-full px-4 py-3 rounded-lg input-dark"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full btn-primary px-6 py-3 rounded-lg"
          >
            {creating ? t('common.creating') : t('session.create')}
          </button>
        </form>
      </div>
    </div>
  )
}
