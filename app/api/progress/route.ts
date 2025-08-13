import { NextResponse } from "next/server"
import {
  loadTracks,
  saveTracks,
  loadLogs,
  saveLogs,
  recordProgress,
  selectNext,
} from "../../../lib/tracker"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { trackSlug, minutesSpent } = body
    if (!trackSlug) {
      return NextResponse.json({ error: "trackSlug required" }, { status: 400 })
    }
    const tracks = await loadTracks()
    const logs = await loadLogs()
    let result
    try {
      result = recordProgress(tracks, logs, trackSlug, minutesSpent)
    } catch (e: any) {
      if (e.message === "not found")
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      if (e.message === "complete")
        return NextResponse.json({ error: "Vector complete" }, { status: 409 })
      throw e
    }
    await saveTracks(result.tracks)
    await saveLogs(result.logs)
    const suggestion = selectNext(result.tracks, result.logs, {
      slotMinutes: minutesSpent ?? result.updated.avgMinPerAct,
      currentTrackSlug: trackSlug,
    })
    return NextResponse.json({
      updatedTrack: result.updated,
      suggestedNext: suggestion,
    })
  } catch (e) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }
}
