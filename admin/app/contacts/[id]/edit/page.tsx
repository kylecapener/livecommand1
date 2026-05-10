import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Nav } from '@/components/Nav'
import { ContactForm } from '@/components/ContactForm'
import Link from 'next/link'

export default async function EditContactPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')

  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const contact = await prisma.contact.findUnique({ where: { id } })
  if (!contact) notFound()

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Nav username={session.user!.username} />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Link href={`/contacts/${id}`} className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#52525b' }}>
            ← {contact.name}
          </Link>
          <h1 className="rainbow-text text-4xl font-black tracking-tight mt-3">Edit Contact</h1>
        </div>
        <ContactForm
          contactId={id}
          initialValues={{ name: contact.name, phone: contact.phone, notes: contact.notes }}
        />
      </main>
    </div>
  )
}
