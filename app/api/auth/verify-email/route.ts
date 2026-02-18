import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/signin?error=missing_token', request.url))
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/signin?error=invalid_token', request.url))
    }

    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      })
      return NextResponse.redirect(new URL('/signin?error=token_expired', request.url))
    }

    // Mark email as verified
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    })

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    })

    return NextResponse.redirect(new URL('/signin?verified=true', request.url))
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(new URL('/signin?error=verification_failed', request.url))
  }
}
