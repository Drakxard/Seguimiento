import { NextResponse } from "next/server"
import { loadTracks, loadLogs, selectNext } from "../../../lib/tracker"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slotMinutes, currentTrackSlug, forceSwitch } = body
    if (typeof slotMinutes !== "number") {
      return NextResponse.json({ error: "slotMinutes required" }, { status: 400 })
    }
    const tracks = await loadTracks()
    const logs = await loadLogs()
    const suggestion = selectNext(tracks, logs, {
      slotMinutes,
      currentTrackSlug,
      forceSwitch,
    })
    if (!suggestion) return new NextResponse(null, { status: 204 })
    return NextResponse.json(suggestion)
  } catch (e) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }
}
