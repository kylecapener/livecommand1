'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  contactId?: number
  initialValues?: { name: string; phone: string; notes: string }
}

export function ContactForm({ contactId, initialValues }: Props) {
  const router = useRouter()
  const isEdit = !!contactId

  const [name, setName] = useState(initialValues?.name ?? '')
  const [phone, setPhone] = useState(initialValues?.phone ?? '')
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const url = isEdit ? `/api/contacts/${contactId}` : '/api/contacts'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, notes }),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/contacts/${isEdit ? contactId : data.id}`)
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Failed to save contact.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#71717a' }}>
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          autoFocus
          placeholder="Full name"
          className="input-dark"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#71717a' }}>
          Phone
        </label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
          placeholder="(555) 000-0000"
          className="input-dark"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#71717a' }}>
          Notes
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          placeholder="Any notes about this contact…"
          className="input-dark"
          style={{ resize: 'none' }}
        />
      </div>

      {error && (
        <p className="text-xs py-2 px-3 rounded-lg" style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={saving} className="btn-gold">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Contact'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm px-4 py-2 rounded-lg transition-colors"
          style={{ color: '#71717a', border: '1px solid #2a2a2a' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
