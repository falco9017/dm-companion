import { auth } from './lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const session = await auth()
  const isAuthenticated = !!session

  if (!isAuthenticated && request.nextUrl.pathname.startsWith('/campaigns')) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  if (!isAuthenticated && request.nextUrl.pathname.startsWith('/api/audio')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isAuthenticated && request.nextUrl.pathname.startsWith('/api/chat')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/campaigns/:path*',
    '/api/audio/:path*',
    '/api/chat/:path*',
  ],
}
