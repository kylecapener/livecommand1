'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate, formatWeekRange, getWeekStart } from '@/lib/utils'

type Payment = {
  id: number
  amount: number
  date: string
  note: string
}

function groupByWeek(payments: Payment[]): [string, Payment[]][] {
  const map = new Map<string, Payment[]>()
  for (const p of payments) {
    const weekStart = getWeekStart(new Date(p.date))
    const key = weekStart.toISOString()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a))
}

function todayString() {
  return new Date().toISOString().split('T')[0]
}

export function PaymentSection({
  contactId,
  initialPayments,
  weekTotal,
  allTimeTotal,
}: {
  contactId: number
  initialPayments: Payment[]
  weekTotal: number
  allTimeTotal: number
}) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayString())
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch(`/api/contacts/${contactId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, date, note }),
    })
    if (res.ok) {
      setAmount('')
      setNote('')
      setDate(todayString())
      router.refresh()
    } else {
      setError('Failed to add payment.')
    }
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this payment?')) return
    const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
    else alert('Failed to delete payment.')
  }

  const weeks = groupByWeek(initialPayments)

  return (
    <div className="space-y-6">
      {/* Totals */}
      <div className="grid grid-cols-2 gap-4 max-w-xs">
        <div className="card">
          <div className="rainbow-bar" />
          <div className="px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#52525b' }}>This Week</p>
            <p className="text-2xl font-bold amount">{formatCurrency(weekTotal)}</p>
          </div>
        </div>
        <div className="card">
          <div className="rainbow-bar" />
          <div className="px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#52525b' }}>All-Time</p>
            <p className="text-2xl font-bold amount">{formatCurrency(allTimeTotal)}</p>
          </div>
        </div>
      </div>

      {/* Add payment */}
      <div className="card">
        <div className="rainbow-bar" />
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#52525b' }}>Log Payment</p>
          <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#71717a' }}>Amount</label>
              <input
                type="number" min="0.01" step="0.01"
                value={amount} onChange={e => setAmount(e.target.value)}
                required placeholder="0.00"
                className="input-dark" style={{ width: '110px' }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#71717a' }}>Date</label>
              <input
                type="date" value={date} onChange={e => setDate(e.target.value)}
                required className="input-dark" style={{ width: 'auto' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label className="block text-xs mb-1.5" style={{ color: '#71717a' }}>Note</label>
              <input
                type="text" value={note} onChange={e => setNote(e.target.value)}
                placeholder="Optional" className="input-dark"
              />
            </div>
            <button type="submit" disabled={saving} className="btn-gold">
              {saving ? 'Adding…' : 'Add'}
            </button>
          </form>
          {error && <p className="text-xs mt-2" style={{ color: '#f87171' }}>{error}</p>}
        </div>
      </div>

      {/* History */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3f3f46' }}>Payment History</p>
        {weeks.length === 0 ? (
          <div className="card">
            <div className="rainbow-bar" />
            <div className="px-6 py-10 text-center">
              <p className="text-sm" style={{ color: '#3f3f46' }}>No payments logged yet.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {weeks.map(([weekKey, payments]) => {
              const wTotal = payments.reduce((s, p) => s + p.amount, 0)
              return (
                <div key={weekKey} className="card">
                  <div className="rainbow-bar" />
                  <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #161616' }}>
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#52525b' }}>
                      {formatWeekRange(new Date(weekKey))}
                    </span>
                    <span className="amount text-sm">{formatCurrency(wTotal)}</span>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {payments.map((p, i) => (
                        <tr
                          key={p.id}
                          style={{ borderTop: i > 0 ? '1px solid #161616' : undefined }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#141414')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td className="px-5 py-3 text-xs" style={{ color: '#52525b' }}>{formatDate(p.date)}</td>
                          <td className="px-5 py-3 amount font-semibold">{formatCurrency(p.amount)}</td>
                          <td className="px-5 py-3 text-xs" style={{ color: '#3f3f46' }}>{p.note}</td>
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="text-xs transition-colors"
                              style={{ color: '#3f3f46' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#3f3f46')}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
