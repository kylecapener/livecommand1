import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { type SessionData, sessionOptions } from '@/lib/session'

export async function POST() {
  const session = await getIronSession<SessionData>(cookies() as any, sessionOptions)
  session.destroy()
  return NextResponse.json({ ok: true })
}
