import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { accounts: true },
    })

    if (existingUser) {
      // User exists with password already set — can't sign up again
      if (existingUser.password) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
      }

      // User exists via Google OAuth but has no password — link accounts
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          name: existingUser.name || name || undefined,
          emailVerified: existingUser.emailVerified || new Date(), // Google already verified their email
        },
      })

      // Create a credentials Account record for this user
      const hasCredentialsAccount = existingUser.accounts.some(a => a.provider === 'credentials')
      if (!hasCredentialsAccount) {
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: existingUser.id,
          },
        })
      }

      return NextResponse.json({
        message: 'Password added to your existing account. You can now sign in with email and password.',
        linked: true,
      })
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name || null,
        password: hashedPassword,
      },
    })

    // Create credentials Account record
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: user.id,
      },
    })

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires,
      },
    })

    // Try to send verification email (non-blocking — account is created regardless)
    try {
      const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || request.nextUrl.origin
      await sendVerificationEmail(normalizedEmail, token, baseUrl)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
    }

    return NextResponse.json({
      message: 'Account created! You can now sign in.',
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
