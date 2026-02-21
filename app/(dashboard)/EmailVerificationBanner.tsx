'use client'

import { useState } from 'react'
import { AlertTriangle, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        {sent ? (
          <span>Verification email sent! Check your inbox.</span>
        ) : error ? (
          <span className="text-destructive">{error}</span>
        ) : (
          <span>
            Your email is not verified.{' '}
            <button
              onClick={handleResend}
              disabled={sending}
              className="underline hover:text-amber-600 dark:hover:text-amber-200 transition-colors font-medium"
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
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
        onClick={() => setDismissed(true)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}
