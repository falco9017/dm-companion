import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import SignInForm from './SignInForm'

export default async function SignInPage() {
  const session = await auth()
  if (session?.user) {
    redirect('/campaigns')
  }

  return <SignInForm />
}
