import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Always return success to avoid leaking whether email exists
    const successResponse = NextResponse.json({
      message: 'If an account exists with that email, a password reset link has been sent.',
    })

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // Only send reset if user exists and has a password (credentials account)
    if (!user || !user.password) {
      return successResponse
    }

    // Delete any existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: `reset:${normalizedEmail}` },
    })

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${normalizedEmail}`,
        token,
        expires,
      },
    })

    const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || request.nextUrl.origin
    await sendPasswordResetEmail(normalizedEmail, token, baseUrl)

    return successResponse
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
