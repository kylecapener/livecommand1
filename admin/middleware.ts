import { NextResponse, type NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { type SessionData, sessionOptions } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  // Read session from the incoming request cookie
  const res = new Response()
  const session = await getIronSession<SessionData>(request, res, sessionOptions)

  if (!session.isLoggedIn) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
