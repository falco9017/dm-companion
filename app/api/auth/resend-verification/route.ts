import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user || user.emailVerified) {
      // Don't reveal whether the email exists
      return NextResponse.json({ message: 'If the email exists, a verification link has been sent.' })
    }

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    })

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires,
      },
    })

    const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || request.nextUrl.origin
    await sendVerificationEmail(normalizedEmail, token, baseUrl)

    return NextResponse.json({ message: 'Verification email sent.' })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
