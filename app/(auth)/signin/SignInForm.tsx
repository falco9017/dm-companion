'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Scroll, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function SignInForm() {
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified') === 'true'
  const reset = searchParams.get('reset') === 'true'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const statusMessage = verified
    ? 'Email verified! You can now sign in.'
    : reset
    ? 'Password reset successfully. Sign in with your new password.'
    : errorParam === 'token_expired'
    ? 'Verification link has expired. Please sign up again.'
    : errorParam === 'invalid_token'
    ? 'Invalid verification link.'
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password.')
      } else if (result?.ok) {
        window.location.href = '/campaigns'
      }
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
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">DM Companion</h1>
            <p className="text-text-muted">Sign in to manage your campaigns</p>
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-lg text-sm mb-6 ${
              verified || reset
                ? 'bg-success/10 border border-success/20 text-emerald-400'
                : 'bg-error/10 border border-error/20 text-red-400'
            }`}>
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-accent-purple-light hover:text-accent-purple transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-theme" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-surface text-text-muted">or continue with</span>
            </div>
          </div>

          <button
            onClick={() => signIn('google', { callbackUrl: '/campaigns' })}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 rounded-lg px-6 py-3 font-semibold hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-sm text-text-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-accent-purple-light hover:text-accent-purple transition-colors font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
