import { Mail } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-glow px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Check Your Email</h1>
              <p className="text-muted-foreground">
                We&apos;ve sent a verification link to your email address. Click the link to verify your account.
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg border border-border text-sm text-muted-foreground space-y-2">
              <p>Didn&apos;t receive the email?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email</li>
                <li>Try signing up again to resend the verification email</li>
              </ul>
            </div>

            <div className="mt-6 space-y-3">
              <Button asChild className="w-full">
                <Link href="/signin">Go to Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signup">Sign Up Again</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
