import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getWeekStart, getWeekEnd } from '@/lib/utils'
import { Nav } from '@/components/Nav'
import { PaymentSection } from '@/components/PaymentSection'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ContactPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')

  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: { payments: { orderBy: { date: 'desc' } } },
  })
  if (!contact) notFound()

  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  const weekTotal = contact.payments
    .filter(p => new Date(p.date) >= weekStart && new Date(p.date) < weekEnd)
    .reduce((s, p) => s + p.amount, 0)

  const allTimeTotal = contact.payments.reduce((s, p) => s + p.amount, 0)

  const payments = contact.payments.map(p => ({
    id: p.id,
    amount: p.amount,
    date: p.date.toISOString(),
    note: p.note,
  }))

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Nav username={session.user!.username} />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-10">
          <div>
            <Link href="/dashboard" className="text-xs font-semibold uppercase tracking-widest transition-colors" style={{ color: '#52525b' }}>
              ← Dashboard
            </Link>
            <h1 className="rainbow-text text-4xl font-black tracking-tight mt-3">{contact.name}</h1>
            <p className="text-sm mt-1" style={{ color: '#52525b' }}>{contact.phone}</p>
            {contact.notes && (
              <p className="text-sm mt-3 px-4 py-3 rounded-xl max-w-lg" style={{ color: '#71717a', background: '#111', border: '1px solid #1e1e1e' }}>
                {contact.notes}
              </p>
            )}
          </div>
          <Link href={`/contacts/${id}/edit`} className="text-sm px-4 py-2 rounded-lg transition-colors" style={{ color: '#71717a', border: '1px solid #2a2a2a' }}>
            Edit
          </Link>
        </div>

        <PaymentSection
          contactId={id}
          initialPayments={payments}
          weekTotal={weekTotal}
          allTimeTotal={allTimeTotal}
        />
      </main>
    </div>
  )
}
