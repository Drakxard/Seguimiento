import { NextResponse } from "next/server";
import { registerProgress, getNextSuggestion } from "../../../lib/scheduler";
import { loadState, getStoredResponse, storeResponse } from "../../../lib/state";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackSlug = searchParams.get("track")?.toLowerCase();
  const minutes = searchParams.get("minutes");
  const nextIndex = searchParams.get("nextIndex") ?? searchParams.get("activityId");
  const reqId = searchParams.get("reqId");
  const ts = searchParams.get("ts");
  if (!trackSlug || !reqId || !ts) {
    return new Response("Missing parameters", { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const cached = getStoredResponse("progress", reqId);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "no-store" } });
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
  storeResponse("progress", reqId, response);
  return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
}
