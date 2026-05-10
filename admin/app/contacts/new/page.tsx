import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Nav } from '@/components/Nav'
import { ContactForm } from '@/components/ContactForm'

export default async function NewContactPage() {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Nav username={session.user!.username} />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="rainbow-text text-4xl font-black tracking-tight">Add Contact</h1>
          <p className="text-sm mt-1" style={{ color: '#52525b' }}>Enter the contact's details below.</p>
        </div>
        <ContactForm />
      </main>
    </div>
  )
}
