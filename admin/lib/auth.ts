import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { type SessionData, sessionOptions } from './session'

// Change these credentials before deploying
export const ADMINS = [
  { username: 'admin1', password: 'admin1pass' },
  { username: 'admin2', password: 'admin2pass' },
]

export async function getSession() {
  return getIronSession<SessionData>(cookies() as any, sessionOptions)
}
