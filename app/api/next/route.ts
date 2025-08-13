import { NextResponse } from "next/server"
import { selectNextTrack } from "../../../lib/scheduler"

export async function POST(request: Request) {
  const body = await request.json()
  const { slotMinutes, currentTrackSlug, forceSwitch } = body
  const choice = selectNextTrack({ slotMinutes, currentTrackSlug, forceSwitch })
  if (!choice) return new NextResponse(null, { status: 204 })
  return NextResponse.json(choice)
}
