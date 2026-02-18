'use client'

import { useState } from 'react'
import { Scroll, Mail, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        return
      }

      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-glow px-4">
      <div className="w-full max-w-md">
        <div className="glass-card-elevated rounded-2xl p-6 sm:p-8 shadow-2xl bg-surface">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center mx-auto mb-4">
              <Scroll className="w-6 h-6 text-accent-purple-light" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Forgot Password</h1>
            <p className="text-text-muted">Enter your email and we&apos;ll send you a reset link</p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-emerald-400 text-sm">
                If an account exists with that email, a password reset link has been sent. Check your inbox.
              </div>
              <Link
                href="/signin"
                className="block w-full text-center btn-primary py-2.5 rounded-lg font-semibold"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg input-dark text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-text-muted mt-6">
            <Link href="/signin" className="text-accent-purple-light hover:text-accent-purple transition-colors font-medium">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
