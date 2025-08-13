import { NextResponse } from "next/server";
import { registerProgress, getNextSuggestion } from "../../../lib/scheduler";
import { loadState, saveState } from "../../../lib/state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const track = url.searchParams.get("track");
  const minutes = url.searchParams.get("minutes");
  const nextIndexParam = url.searchParams.get("nextIndex");
  const reqId = url.searchParams.get("reqId");
  const ts = url.searchParams.get("ts");
  if (!track || !reqId || !ts) {
    return NextResponse.json({ error: "missing parameters" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const state = loadState();
  if (state.processed[reqId]) {
    return NextResponse.json(state.processed[reqId], { headers: { "Cache-Control": "no-store" } });
  }
  const minutesSpent = minutes ? parseInt(minutes, 10) : undefined;
  const nextIndex = nextIndexParam ? parseInt(nextIndexParam, 10) : undefined;
  const updatedTrack = registerProgress(track, minutesSpent, nextIndex);
  if (!updatedTrack) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  const suggestedNext = getNextSuggestion({
    slotMinutes: minutesSpent ?? updatedTrack.avgMinPerAct,
    currentTrackSlug: track,
    forceSwitch: false,
  });
  const response = { updatedTrack, suggestedNext };
  state.processed[reqId] = response;
  saveState();
  return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
}
