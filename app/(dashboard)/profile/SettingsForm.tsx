'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserProfile } from '@/actions/profile'
import { useI18n } from '@/lib/i18n-context'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SettingsFormProps {
  userId: string
  name: string
  uiLanguage: string
  dateFormat: string
}

export default function SettingsForm({ userId, name: initialName, uiLanguage: initialLang, dateFormat: initialDateFormat }: SettingsFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [uiLanguage, setUiLanguage] = useState(initialLang)
  const [dateFormat, setDateFormat] = useState(initialDateFormat)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { t } = useI18n()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await updateUserProfile(userId, { name, uiLanguage, dateFormat })
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">{t('profile.displayName')}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('profile.displayNamePlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="uiLanguage">{t('profile.uiLanguage')}</Label>
        <select
          id="uiLanguage"
          value={uiLanguage}
          onChange={(e) => setUiLanguage(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="en">English</option>
          <option value="it">Italian</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="es">Español</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateFormat">{t('profile.dateFormat')}</Label>
        <select
          id="dateFormat"
          value={dateFormat}
          onChange={(e) => setDateFormat(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="DD.MM.YY">DD.MM.YY</option>
          <option value="MM/DD/YY">MM/DD/YY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? t('common.saving') : saved ? t('profile.saved') : t('settings.saveChanges')}
      </Button>
    </form>
  )
}
