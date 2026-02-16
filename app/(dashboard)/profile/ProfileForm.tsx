'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserProfile } from '@/actions/profile'

interface ProfileFormProps {
  userId: string
  name: string
  uiLanguage: string
}

export default function ProfileForm({ userId, name: initialName, uiLanguage: initialLang }: ProfileFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [uiLanguage, setUiLanguage] = useState(initialLang)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await updateUserProfile(userId, { name, uiLanguage })
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
          Display Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg input-dark"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="uiLanguage" className="block text-sm font-medium text-text-secondary mb-1">
          UI Language
        </label>
        <select
          id="uiLanguage"
          value={uiLanguage}
          onChange={(e) => setUiLanguage(e.target.value)}
          className="w-full px-4 py-3 rounded-lg input-dark"
        >
          <option value="en">English</option>
          <option value="it">Italian</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full btn-primary px-6 py-3 rounded-lg"
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
      </button>
    </form>
  )
}
