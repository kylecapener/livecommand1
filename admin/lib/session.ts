// No next/headers imports here — this file is safe to use in middleware
export interface SessionData {
  user?: { username: string }
  isLoggedIn: boolean
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET ?? 'lc-admin-iron-session-secret-change-me-32chars!!',
  cookieName: 'lc-admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
  },
}
