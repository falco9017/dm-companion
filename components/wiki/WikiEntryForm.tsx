'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createWikiEntry } from '@/actions/wiki'
import { Save } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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
        type: type as import('@prisma/client').WikiEntryType,
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
        <div className="space-y-2">
          <Label htmlFor="title">{t('wiki.form.title')}</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder={t('wiki.form.titlePlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">{t('wiki.form.type')}</Label>
          <select
            id="type"
            name="type"
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {ENTRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`wiki.typeSingle.${type}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">{t('wiki.form.content')}</Label>
        <Textarea
          id="content"
          name="content"
          required
          rows={5}
          placeholder={t('wiki.form.contentPlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">{t('wiki.form.tags')}</Label>
        <Input
          id="tags"
          name="tags"
          placeholder={t('wiki.form.tagsPlaceholder')}
        />
      </div>

      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? t('common.saving') : t('common.createEntry')}
        </Button>
        {onDone && (
          <Button type="button" variant="outline" onClick={onDone}>
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </form>
  )
}
