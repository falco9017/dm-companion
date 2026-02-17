'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createWikiEntry } from '@/actions/wiki'
import { Save } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'

const ENTRY_TYPES = [
  'CHARACTER', 'NPC', 'LOCATION', 'ITEM', 'FACTION',
  'EVENT', 'QUEST', 'LORE', 'SESSION_RECAP', 'OTHER',
] as const

interface WikiEntryFormProps {
  campaignId: string
  userId: string
  onDone?: () => void
}

export default function WikiEntryForm({ campaignId, userId, onDone }: WikiEntryFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useI18n()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const type = formData.get('type') as string
    const content = formData.get('content') as string
    const tagsRaw = formData.get('tags') as string

    try {
      await createWikiEntry(campaignId, userId, {
        title,
        type: type as any,
        content,
        tags: tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [],
      })

      router.refresh()
      onDone?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">
            {t('wiki.form.title')}
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full px-3 py-2.5 rounded-lg input-dark text-sm"
            placeholder={t('wiki.form.titlePlaceholder')}
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-text-secondary mb-1">
            {t('wiki.form.type')}
          </label>
          <select
            id="type"
            name="type"
            required
            className="w-full px-3 py-2.5 rounded-lg input-dark text-sm"
          >
            {ENTRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`wiki.typeSingle.${type}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-text-secondary mb-1">
          {t('wiki.form.content')}
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={5}
          className="w-full px-3 py-2.5 rounded-lg input-dark text-sm"
          placeholder={t('wiki.form.contentPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-text-secondary mb-1">
          {t('wiki.form.tags')}
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          className="w-full px-3 py-2.5 rounded-lg input-dark text-sm"
          placeholder={t('wiki.form.tagsPlaceholder')}
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? t('common.saving') : t('common.createEntry')}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="px-5 py-2.5 rounded-lg border border-border-theme text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors text-sm"
          >
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  )
}
