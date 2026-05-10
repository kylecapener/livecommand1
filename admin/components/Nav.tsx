'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/contacts/new', label: 'Add Contact' },
]

export function Nav({ username }: { username: string }) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav style={{ background: '#0a0a0a', borderBottom: '1px solid #1a1a1a' }}>
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="rainbow-text text-base font-black tracking-tight">
            LiveCommand
          </Link>
          <div className="flex items-center gap-6">
            {links.map(link => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm transition-colors"
                  style={{ color: active ? '#F5C542' : '#71717a' }}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span style={{ color: '#3f3f46' }}>{username}</span>
          <button
            onClick={handleLogout}
            className="text-sm transition-colors"
            style={{ color: '#52525b' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a1a1aa')}
            onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
