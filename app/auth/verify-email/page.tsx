import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-glow px-4">
      <div className="w-full max-w-md">
        <div className="glass-card-elevated rounded-2xl p-6 sm:p-8 shadow-2xl bg-surface">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-accent-purple-light" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Check Your Email</h1>
            <p className="text-text-muted">
              We&apos;ve sent a verification link to your email address. Click the link to verify your account.
            </p>
          </div>

          <div className="p-4 bg-surface-elevated rounded-lg border border-border-theme text-sm text-text-secondary space-y-2">
            <p>Didn&apos;t receive the email?</p>
            <ul className="list-disc list-inside text-text-muted space-y-1">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Try signing up again to resend the verification email</li>
            </ul>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/signin"
              className="block w-full text-center btn-primary py-2.5 rounded-lg font-semibold"
            >
              Go to Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="block w-full text-center py-2.5 rounded-lg font-semibold border border-border-theme text-text-secondary hover:text-text-primary hover:border-accent-purple/50 transition-colors"
            >
              Sign Up Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
