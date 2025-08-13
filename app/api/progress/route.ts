import { NextResponse } from "next/server";
import { registerProgress, getNextSuggestion } from "../../../lib/scheduler";

export async function POST(request: Request) {
  const body = await request.json();
  const { trackSlug, minutesSpent, nextIndex } = body;
  const updatedTrack = registerProgress(trackSlug, minutesSpent, nextIndex);
  if (!updatedTrack) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const suggestedNext = getNextSuggestion({
    slotMinutes: minutesSpent ?? updatedTrack.avgMinPerAct,
    currentTrackSlug: trackSlug,
    forceSwitch: false,
  });
  return NextResponse.json({ updatedTrack, suggestedNext });
}
