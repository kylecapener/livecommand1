import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const contact = await prisma.contact.findUnique({
    where: { id: parseInt(params.id) },
    include: { payments: { orderBy: { date: 'desc' } } },
  })
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(contact)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { name, phone, notes } = await request.json()
  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
  }
  const contact = await prisma.contact.update({
    where: { id: parseInt(params.id) },
    data: { name: name.trim(), phone: phone.trim(), notes: notes?.trim() ?? '' },
  })
  return NextResponse.json(contact)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.contact.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ ok: true })
}
