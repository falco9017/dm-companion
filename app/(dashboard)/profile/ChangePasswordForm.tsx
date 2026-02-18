'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (next !== confirm) {
      setError('New passwords do not match.')
      return
    }
    if (next.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
      } else {
        setSaved(true)
        setCurrent('')
        setNext('')
        setConfirm('')
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { id: 'current', label: 'Current password', value: current, setter: setCurrent, show: showCurrent, toggleShow: () => setShowCurrent(v => !v) },
        { id: 'next', label: 'New password', value: next, setter: setNext, show: showNext, toggleShow: () => setShowNext(v => !v) },
        { id: 'confirm', label: 'Confirm new password', value: confirm, setter: setConfirm, show: showConfirm, toggleShow: () => setShowConfirm(v => !v) },
      ].map(({ id, label, value, setter, show, toggleShow }) => (
        <div key={id}>
          <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">
            {label}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              id={id}
              type={show ? 'text' : 'password'}
              value={value}
              onChange={e => setter(e.target.value)}
              required
              minLength={id !== 'current' ? 8 : undefined}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg input-dark text-sm"
            />
            <button
              type="button"
              onClick={toggleShow}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ))}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full btn-primary px-6 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
        ) : saved ? (
          'Password updated!'
        ) : (
          'Update password'
        )}
      </button>
    </form>
  )
}
