// @ts-nocheck
import { NextResponse } from "next/server"
import { events, Event } from "../../../lib/events"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (id) {
    const event = events.find((e) => e.id === id)
    if (event) return NextResponse.json(event)
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }
  return NextResponse.json(events)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, event } = body

  switch (action) {
    case "add":
      events.push(event)
      return NextResponse.json({ status: "added" })
    case "edit":
      const index = events.findIndex((e) => e.id === event.id)
      if (index !== -1) events[index] = event
      return NextResponse.json({ status: "updated" })
    case "delete":
      const idx = events.findIndex((e) => e.id === event.id)
      if (idx !== -1) events.splice(idx, 1)
      return NextResponse.json({ status: "deleted" })
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }
}
