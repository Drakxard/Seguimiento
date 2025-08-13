import { NextResponse } from "next/server";
import { registerProgress, getNextSuggestion } from "../../../lib/scheduler";
import { loadState, incrementRequestCount } from "../../../lib/state";

export async function GET(request: Request) {
  if (!incrementRequestCount("progress")) {
    return new Response("Daily limit reached", { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const trackSlug = searchParams.get("track")?.toLowerCase();
  const minutes = searchParams.get("minutes");
  const nextIndex = searchParams.get("nextIndex") ?? searchParams.get("activityId");
  if (!trackSlug) {
    return new Response("Missing parameters", { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const state = loadState();
  const track = state.tracks.find((t) => t.slug === trackSlug);
  if (!track) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  if (track.R <= 0) {
    return NextResponse.json({ error: "Vector completo" }, { status: 409, headers: { "Cache-Control": "no-store" } });
  }

  const minutesNum = minutes ? parseInt(minutes, 10) : undefined;
  const nextIndexNum = nextIndex ? parseInt(nextIndex, 10) : undefined;

  const result = registerProgress(trackSlug, minutesNum, nextIndexNum);
  if (!result || result.error) {
    return new Response("Internal error", { status: 500, headers: { "Cache-Control": "no-store" } });
  }
  const updatedTrack = result.track;

  const suggestedNext = getNextSuggestion({
    slotMinutes: minutesNum ?? updatedTrack.avgMinPerAct,
    currentTrackSlug: trackSlug,
    forceSwitch: false,
  });

  const response = { updatedTrack, suggestedNext };
  return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
}
