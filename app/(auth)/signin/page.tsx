import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import SignInForm from './SignInForm'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await auth()
  if (session?.user) {
    const { callbackUrl } = await searchParams
    redirect(callbackUrl || '/campaigns')
  }

  return <SignInForm />
}
