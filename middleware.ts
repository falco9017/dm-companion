import { auth } from './lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isAuthenticated = !!req.auth

  if (!isAuthenticated && req.nextUrl.pathname.startsWith('/campaigns')) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  if (!isAuthenticated && req.nextUrl.pathname.startsWith('/api/audio')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isAuthenticated && req.nextUrl.pathname.startsWith('/api/chat')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/campaigns/:path*',
    '/api/audio/:path*',
    '/api/chat/:path*',
  ],
}
