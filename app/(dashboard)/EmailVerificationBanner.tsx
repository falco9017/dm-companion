'use client'

import { useState } from 'react'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

export function EmailVerificationBanner({ email }: { email: string | null }) {
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (dismissed) return null

  async function handleResend() {
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to send verification email.')
      } else {
        setSent(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-amber-900/30 border-b border-amber-700/40 px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-amber-300">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        {sent ? (
          <span>Verification email sent! Check your inbox.</span>
        ) : error ? (
          <span className="text-red-400">{error}</span>
        ) : (
          <span>
            Your email is not verified.{' '}
            <button
              onClick={handleResend}
              disabled={sending}
              className="underline hover:text-amber-200 transition-colors font-medium"
            >
              {sending ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Resend verification email'
              )}
            </button>
          </span>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400 hover:text-amber-200 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
