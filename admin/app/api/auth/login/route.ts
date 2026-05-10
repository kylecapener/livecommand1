import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { type SessionData, sessionOptions } from '@/lib/session'
import { ADMINS } from '@/lib/auth'

export async function POST(request: Request) {
  const { username, password } = await request.json()

  const admin = ADMINS.find(a => a.username === username && a.password === password)
  if (!admin) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const session = await getIronSession<SessionData>(cookies() as any, sessionOptions)
  session.user = { username: admin.username }
  session.isLoggedIn = true
  await session.save()

  return NextResponse.json({ ok: true })
}
