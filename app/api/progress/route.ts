import { NextResponse } from "next/server";
import { registerProgress, getNextSuggestion } from "../../../lib/scheduler";
import { checkRateLimit } from "../../../lib/state";

export async function GET(request: Request) {
  if (!checkRateLimit('progress')) {
    return new Response('Límite diario alcanzado', { status: 429, headers: { "Cache-Control": "no-store" } });
  }
  const { searchParams } = new URL(request.url);
  const trackSlug = searchParams.get("track")?.toLowerCase();
  const minutes = searchParams.get("minutes");
  const nextIndex = searchParams.get("nextIndex") ?? searchParams.get("activityId");
  if (!trackSlug) {
    return new Response("Missing parameters", { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const minutesNum = minutes ? parseInt(minutes, 10) : undefined;
  const nextIndexNum = nextIndex ? parseInt(nextIndex, 10) : undefined;

  const result = registerProgress(trackSlug, minutesNum, nextIndexNum);
  if (!result || (result as any).error === 'not_found') {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  if ((result as any).error === 'complete') {
    return NextResponse.json({ error: "Vector completo" }, { status: 409, headers: { "Cache-Control": "no-store" } });
  }
  const updatedTrack = (result as any).track;

  const suggestedNext = getNextSuggestion({
    slotMinutes: minutesNum ?? updatedTrack.avgMinPerAct,
    currentTrackSlug: trackSlug,
    forceSwitch: false,
  });

  return NextResponse.json({ updatedTrack, suggestedNext }, { headers: { "Cache-Control": "no-store" } });
}
