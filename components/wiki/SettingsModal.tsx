'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCampaign, deleteCampaign } from '@/actions/campaigns'
import { AlertTriangle } from 'lucide-react'

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
}

export default function SettingsModal({
  campaignId,
  userId,
  campaign,
  isOpen,
  onClose,
}: SettingsModalProps) {
  const router = useRouter()
  const [name, setName] = useState(campaign.name)
  const [description, setDescription] = useState(campaign.description || '')
  const [language, setLanguage] = useState(campaign.language)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
      <div className="relative glass-card-elevated bg-surface rounded-xl w-full max-w-lg mx-3 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border-theme">
          <h2 className="text-xl font-bold text-text-primary">Campaign Settings</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xl transition-colors">&times;</button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label htmlFor="settings-name" className="block text-sm font-medium text-text-secondary mb-1">
              Campaign Name *
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
              Description
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
              Language
            </label>
            <select
              id="settings-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 rounded-lg input-dark"
            >
              <option value="en">English</option>
              <option value="it">Italian</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full btn-primary px-6 py-2.5 rounded-lg"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="px-6 pb-6">
          <div className="bg-error/5 border border-error/20 rounded-lg p-4">
            <h3 className="text-sm font-bold text-red-400 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </h3>
            <p className="text-text-muted text-xs mb-3">
              Permanently delete this campaign and all its data.
            </p>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full bg-error/20 hover:bg-error/30 text-red-400 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              {deleting ? 'Deleting...' : 'Delete Campaign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
