import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getWeekStart, getWeekEnd, formatCurrency } from '@/lib/utils'
import { Nav } from '@/components/Nav'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function CrownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#F5C542" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 18h18v2H3v-2zm0-2 3-9 4.5 4.5L12 4l1.5 7.5L18 7l3 9H3z" />
    </svg>
  )
}

const RAINBOW = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7']
const TOP3: Record<number, string> = { 1: '#F5C542', 2: '#9CA3AF', 3: '#92400E' }

export default async function LeaderboardPage() {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')

  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  const contacts = await prisma.contact.findMany({ include: { payments: true } })

  const ranked = contacts
    .map(c => ({
      id: c.id,
      name: c.name,
      weekTotal: c.payments
        .filter(p => new Date(p.date) >= weekStart && new Date(p.date) < weekEnd)
        .reduce((s, p) => s + p.amount, 0),
      allTimeTotal: c.payments.reduce((s, p) => s + p.amount, 0),
    }))
    .sort((a, b) => b.allTimeTotal - a.allTimeTotal)

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Nav username={session.user!.username} />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="rainbow-text text-4xl font-black tracking-tight">Leaderboard</h1>
          <p className="text-sm mt-1" style={{ color: '#52525b' }}>Ranked by all-time total</p>
        </div>

        {ranked.length === 0 ? (
          <div className="card">
            <div className="rainbow-bar" />
            <div className="px-6 py-16 text-center">
              <p className="text-sm" style={{ color: '#52525b' }}>No contacts yet.</p>
              <Link href="/contacts/new" className="text-sm mt-2 inline-block" style={{ color: '#71717a' }}>
                Add your first contact →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {ranked.map((c, i) => {
              const rank = i + 1
              const rankColor = TOP3[rank] ?? RAINBOW[(rank - 4) % RAINBOW.length]
              return (
                <div key={c.id} className={rank === 1 ? 'card-gold' : 'card-subtle'}>
                  <div className="rainbow-bar" />
                  <div className="flex items-center px-6 py-5 gap-5">
                    <div className="w-10 flex-shrink-0 flex flex-col items-center gap-1">
                      {rank === 1 && <CrownIcon />}
                      <span className="text-xl font-black" style={{ color: rankColor, fontVariantNumeric: 'tabular-nums' }}>
                        {rank}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/contacts/${c.id}`}>
                        <p className="font-semibold text-white hover:underline truncate">{c.name}</p>
                      </Link>
                      <p className="text-xs mt-0.5" style={{ color: '#52525b' }}>
                        This week: <span className="amount">{formatCurrency(c.weekTotal)}</span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold amount" style={{ fontSize: rank === 1 ? '1.4rem' : '1.1rem' }}>
                        {formatCurrency(c.allTimeTotal)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#3f3f46' }}>all-time</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
