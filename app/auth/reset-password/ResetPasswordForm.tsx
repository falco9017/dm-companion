'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Scroll, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-radial-glow px-4">
        <div className="w-full max-w-md">
          <div className="glass-card-elevated rounded-2xl p-6 sm:p-8 shadow-2xl bg-surface text-center">
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-red-400 text-sm mb-4">
              Invalid reset link. Please request a new password reset.
            </div>
            <Link
              href="/auth/forgot-password"
              className="inline-block btn-primary px-6 py-2.5 rounded-lg font-semibold"
            >
              Request New Reset
            </Link>
          </div>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
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

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-radial-glow px-4">
        <div className="w-full max-w-md">
          <div className="glass-card-elevated rounded-2xl p-6 sm:p-8 shadow-2xl bg-surface">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold gradient-text mb-2">Password Reset</h1>
            </div>
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-emerald-400 text-sm mb-4">
              Your password has been reset successfully.
            </div>
            <Link
              href="/signin?reset=true"
              className="block w-full text-center btn-primary py-2.5 rounded-lg font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-glow px-4">
      <div className="w-full max-w-md">
        <div className="glass-card-elevated rounded-2xl p-6 sm:p-8 shadow-2xl bg-surface">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center mx-auto mb-4">
              <Scroll className="w-6 h-6 text-accent-purple-light" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Reset Password</h1>
            <p className="text-text-muted">Choose a new password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg input-dark text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg input-dark text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
