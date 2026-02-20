'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserProfile } from '@/actions/profile'
import { useI18n } from '@/lib/i18n-context'

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
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
          {t('profile.displayName')}
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg input-dark"
          placeholder={t('profile.displayNamePlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="uiLanguage" className="block text-sm font-medium text-text-secondary mb-1">
          {t('profile.uiLanguage')}
        </label>
        <select
          id="uiLanguage"
          value={uiLanguage}
          onChange={(e) => setUiLanguage(e.target.value)}
          className="w-full px-4 py-3 rounded-lg input-dark"
        >
          <option value="en">English</option>
          <option value="it">Italian</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="es">Español</option>
        </select>
      </div>

      <div>
        <label htmlFor="dateFormat" className="block text-sm font-medium text-text-secondary mb-1">
          {t('profile.dateFormat')}
        </label>
        <select
          id="dateFormat"
          value={dateFormat}
          onChange={(e) => setDateFormat(e.target.value)}
          className="w-full px-4 py-3 rounded-lg input-dark"
        >
          <option value="DD.MM.YY">DD.MM.YY</option>
          <option value="MM/DD/YY">MM/DD/YY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full btn-primary px-6 py-3 rounded-lg"
      >
        {saving ? t('common.saving') : saved ? t('profile.saved') : t('settings.saveChanges')}
      </button>
    </form>
  )
}
