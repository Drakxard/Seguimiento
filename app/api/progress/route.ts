import { NextResponse } from "next/server"
import { recordProgress, selectNextTrack } from "../../../lib/scheduler"

export async function POST(request: Request) {
  const body = await request.json()
  const { trackSlug, minutesSpent } = body
  const { updatedTrack } = recordProgress({ trackSlug, minutesSpent })
  // Suggest next using same slot minutes
  const suggestedNext = selectNextTrack({
    slotMinutes: minutesSpent ?? updatedTrack.avgMinPerAct,
    currentTrackSlug: trackSlug,
  })
  return NextResponse.json({ updatedTrack, suggestedNext })
}
