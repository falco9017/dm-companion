'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createWikiEntry } from '@/actions/wiki'
import { Save } from 'lucide-react'

const ENTRY_TYPES = [
  { value: 'CHARACTER', label: 'Character' },
  { value: 'NPC', label: 'NPC' },
  { value: 'LOCATION', label: 'Location' },
  { value: 'ITEM', label: 'Item' },
  { value: 'FACTION', label: 'Faction' },
  { value: 'EVENT', label: 'Event' },
  { value: 'QUEST', label: 'Quest' },
  { value: 'LORE', label: 'Lore' },
  { value: 'SESSION_RECAP', label: 'Session Recap' },
  { value: 'OTHER', label: 'Other' },
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
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full px-3 py-2.5 rounded-lg input-dark text-sm"
            placeholder="e.g. Eldrin the Wise"
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-text-secondary mb-1">
            Type *
          </label>
          <select
            id="type"
            name="type"
            required
            className="w-full px-3 py-2.5 rounded-lg input-dark text-sm"
          >
            {ENTRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-text-secondary mb-1">
          Content *
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={5}
          className="w-full px-3 py-2.5 rounded-lg input-dark text-sm"
          placeholder="Write the wiki entry content..."
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-text-secondary mb-1">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          className="w-full px-3 py-2.5 rounded-lg input-dark text-sm"
          placeholder="e.g. wizard, ally, magic"
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
          {saving ? 'Saving...' : 'Create Entry'}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="px-5 py-2.5 rounded-lg border border-border-theme text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
