import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const contacts = await prisma.contact.findMany({
    include: { payments: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(contacts)
}

export async function POST(request: Request) {
  const { name, phone, notes } = await request.json()
  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
  }
  const contact = await prisma.contact.create({
    data: { name: name.trim(), phone: phone.trim(), notes: notes?.trim() ?? '' },
  })
  return NextResponse.json(contact, { status: 201 })
}
