'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCampaign, deleteCampaign } from '@/actions/campaigns'
import { AlertTriangle, Mic } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'

interface SettingsModalProps {
  campaignId: string
  userId: string
  campaign: {
    name: string
    description: string | null
    language: string
  }
  isOpen: boolean
  onClose: () => void
  onVoiceProfilesClick?: () => void
  voiceProfileCount?: number
}

export default function SettingsModal({
  campaignId,
  userId,
  campaign,
  isOpen,
  onClose,
  onVoiceProfilesClick,
  voiceProfileCount = 0,
}: SettingsModalProps) {
  const router = useRouter()
  const [name, setName] = useState(campaign.name)
  const [description, setDescription] = useState(campaign.description || '')
  const [language, setLanguage] = useState(campaign.language)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { t } = useI18n()

  if (!isOpen) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateCampaign(campaignId, userId, { name, description, language })
      router.refresh()
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteCampaign(campaignId, userId)
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-xl w-full max-w-lg mx-3 max-h-[90vh] overflow-y-auto border border-border-theme">
        <div className="flex items-center justify-between p-6 border-b border-border-theme">
          <h2 className="text-xl font-bold text-text-primary">{t('settings.title')}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xl transition-colors">&times;</button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label htmlFor="settings-name" className="block text-sm font-medium text-text-secondary mb-1">
              {t('settings.name')}
            </label>
            <input
              type="text"
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg input-dark"
            />
          </div>

          <div>
            <label htmlFor="settings-desc" className="block text-sm font-medium text-text-secondary mb-1">
              {t('settings.description')}
            </label>
            <textarea
              id="settings-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg input-dark"
            />
          </div>

          <div>
            <label htmlFor="settings-lang" className="block text-sm font-medium text-text-secondary mb-1">
              {t('settings.language')}
            </label>
            <select
              id="settings-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 rounded-lg input-dark"
            >
              <option value="en">English</option>
              <option value="it">Italian</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="es">Español</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full btn-primary px-6 py-2.5 rounded-lg"
          >
            {saving ? t('common.saving') : t('settings.saveChanges')}
          </button>
        </form>

        {/* Voice Profiles section */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-surface-elevated border border-border-theme">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-accent-purple-light" />
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {t('settings.voiceProfiles')}
                </h3>
                <p className="text-xs text-text-muted">
                  {t('voiceProfiles.settingsHint')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {voiceProfileCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple-light">
                  {voiceProfileCount}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onVoiceProfilesClick?.()
                }}
                className="px-3 py-1.5 rounded-lg text-sm bg-surface border border-border-theme text-text-secondary hover:text-text-primary transition-colors"
              >
                {t('voiceProfiles.manage')}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="bg-error/5 border border-error/20 rounded-lg p-4">
            <h3 className="text-sm font-bold text-red-400 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              {t('settings.dangerZone')}
            </h3>
            <p className="text-text-muted text-xs mb-3">
              {t('settings.dangerText')}
            </p>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full bg-error/20 hover:bg-error/30 text-red-400 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              {deleting ? t('common.deleting') : t('settings.deleteCampaign')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
