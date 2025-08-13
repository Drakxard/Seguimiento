import { NextResponse } from "next/server"
import { registerProgress, getNextSuggestion } from "../../../lib/scheduler"
import { tracks } from "../../../lib/tracks"

const processed = new Map<string, any>()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reqId = searchParams.get("reqId")
  const ts = searchParams.get("ts")
  const trackSlug = searchParams.get("track")
  if (!reqId || !ts || !trackSlug) {
    return new NextResponse("missing params", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    })
  }
  if (processed.has(reqId)) {
    return NextResponse.json(processed.get(reqId), {
      headers: { "Cache-Control": "no-store" },
    })
  }

  const track = tracks.find((t) => t.slug === trackSlug)
  if (!track) {
    return new NextResponse("track not found", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    })
  }
  if (track.R <= 0) {
    return new NextResponse("vector complete", {
      status: 409,
      headers: { "Cache-Control": "no-store" },
    })
  }

  const minutesParam = searchParams.get("minutes")
  const minutes = minutesParam ? parseInt(minutesParam, 10) : undefined
  const nextIndexParam = searchParams.get("nextIndex")
  const nextIndex = nextIndexParam ? parseInt(nextIndexParam, 10) : undefined

  const updatedTrack = registerProgress(trackSlug, minutes, nextIndex)
  const suggestedNext = getNextSuggestion({
    slotMinutes: minutes ?? updatedTrack.avgMinPerAct,
    currentTrackSlug: trackSlug,
    forceSwitch: false,
  })
  const response = { updatedTrack, suggestedNext }
  processed.set(reqId, response)
  return NextResponse.json(response, {
    headers: { "Cache-Control": "no-store" },
  })
}
