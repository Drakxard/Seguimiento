import { NextResponse } from 'next/server'

interface Event {
  id: string
  date: string
  name: string
  importance: number
  content: string
  daysRemaining: number
  totalDays?: number
  isEditing: boolean
}

let events: Event[] = []

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (id) {
    const event = events.find((e) => e.id === id)
    if (event) return NextResponse.json(event)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(events)
}

export async function POST(request: Request) {
  const { action, event, id } = await request.json()
  switch (action) {
    case 'add':
      events.push(event)
      break
    case 'edit':
      events = events.map((e) => (e.id === event.id ? { ...e, ...event } : e))
      break
    case 'delete':
      events = events.filter((e) => e.id !== (id || event?.id))
      break
    default:
      break
  }
  return NextResponse.json({ ok: true })
}
