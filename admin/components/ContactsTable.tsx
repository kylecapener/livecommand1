'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export type ContactRow = {
  id: number
  name: string
  phone: string
  weekTotal: number
  allTimeTotal: number
}

export function ContactsTable({ contacts }: { contacts: ContactRow[] }) {
  const router = useRouter()

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete ${name}? All their payment records will also be deleted.`)) return
    const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
    else alert('Failed to delete contact.')
  }

  if (contacts.length === 0) {
    return (
      <div className="card">
        <div className="rainbow-bar" />
        <div className="px-6 py-16 text-center">
          <p className="text-sm" style={{ color: '#52525b' }}>No contacts yet.</p>
          <Link href="/contacts/new" className="text-sm mt-2 inline-block" style={{ color: '#71717a' }}>
            Add your first contact →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="rainbow-bar" />
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
            {['Name', 'Phone', 'This Week', 'All-Time', ''].map(h => (
              <th
                key={h}
                className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-widest ${h === 'This Week' || h === 'All-Time' || h === '' ? 'text-right' : 'text-left'}`}
                style={{ color: '#3f3f46' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contacts.map((c, i) => (
            <tr
              key={c.id}
              style={{ borderTop: i > 0 ? '1px solid #161616' : undefined }}
              onMouseEnter={e => (e.currentTarget.style.background = '#141414')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <td className="px-5 py-4">
                <Link href={`/contacts/${c.id}`} className="font-semibold text-white hover:underline">
                  {c.name}
                </Link>
              </td>
              <td className="px-5 py-4" style={{ color: '#52525b' }}>{c.phone}</td>
              <td className="px-5 py-4 text-right">
                <span className="amount">{formatCurrency(c.weekTotal)}</span>
              </td>
              <td className="px-5 py-4 text-right">
                <span className="amount text-base font-bold">{formatCurrency(c.allTimeTotal)}</span>
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/contacts/${c.id}/edit`}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ color: '#71717a', border: '1px solid #2a2a2a' }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ color: '#71717a', border: '1px solid #2a2a2a' }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
