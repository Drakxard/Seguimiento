// @ts-nocheck
import { NextResponse } from "next/server"
import { events } from "../../../../lib/events"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  let id: string

  if (context.params instanceof Promise) {
    ({ id } = await context.params)
  } else {
    ({ id } = context.params)
  }

  const event = events.find((e) => e.id === id)

  if (event) return NextResponse.json(event)
  return NextResponse.json({ message: "Not found" }, { status: 404 })
}
