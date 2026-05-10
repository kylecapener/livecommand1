import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getWeekStart, getWeekEnd, formatCurrency } from '@/lib/utils'
import { Nav } from '@/components/Nav'
import { ContactsTable } from '@/components/ContactsTable'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')

  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  const contacts = await prisma.contact.findMany({
    include: { payments: true },
    orderBy: { name: 'asc' },
  })

  const rows = contacts.map(c => {
    const weekTotal = c.payments
      .filter(p => new Date(p.date) >= weekStart && new Date(p.date) < weekEnd)
      .reduce((s, p) => s + p.amount, 0)
    const allTimeTotal = c.payments.reduce((s, p) => s + p.amount, 0)
    return { id: c.id, name: c.name, phone: c.phone, weekTotal, allTimeTotal }
  })

  const totalWeek = rows.reduce((s, c) => s + c.weekTotal, 0)
  const totalAllTime = rows.reduce((s, c) => s + c.allTimeTotal, 0)

  const summaryCards = [
    { label: 'Contacts', value: contacts.length.toString(), isAmount: false },
    { label: 'This Week', value: formatCurrency(totalWeek), isAmount: true },
    { label: 'All-Time',  value: formatCurrency(totalAllTime), isAmount: true },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Nav username={session.user!.username} />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="rainbow-text text-4xl font-black tracking-tight">Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: '#52525b' }}>
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/contacts/new" className="btn-gold">+ Add Contact</Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {summaryCards.map(({ label, value, isAmount }) => (
            <div key={label} className="card">
              <div className="rainbow-bar" />
              <div className="px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#52525b' }}>{label}</p>
                <p className="text-3xl font-bold" style={{ color: isAmount ? '#F5C542' : '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <ContactsTable contacts={rows} />
      </main>
    </div>
  )
}
