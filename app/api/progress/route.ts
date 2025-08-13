import { NextResponse } from "next/server";
import { registerProgress, getNextSuggestion } from "../../../lib/scheduler";
import { readState, writeState, resetDayIfNeeded } from "../../../lib/state";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get("reqId");
  const ts = searchParams.get("ts");
  const track = searchParams.get("track");
  if (!reqId || !ts || !track) {
    return new Response("Missing parameters", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  let state = readState();
  resetDayIfNeeded(state);
  writeState(state);

  if (state.progressLog[reqId]) {
    return NextResponse.json(state.progressLog[reqId], {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const trackData = state.tracks.find((t) => t.slug === track);
  if (!trackData) {
    return new Response("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }
  if (trackData.R <= 0) {
    return new Response("Track complete", {
      status: 409,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const minutes = searchParams.get("minutes");
  const nextIndex = searchParams.get("nextIndex");
  const minutesNum = minutes ? parseInt(minutes, 10) : undefined;
  const nextIndexNum = nextIndex ? parseInt(nextIndex, 10) : undefined;

  const updated = registerProgress(track, minutesNum, nextIndexNum);
  if (!updated) {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const suggestion = getNextSuggestion({
    slotMinutes: minutesNum ?? updated.avgMinPerAct,
    currentTrackSlug: track,
    forceSwitch: false,
  });

  const responseData = {
    updatedTrack: {
      slug: updated.slug,
      doneActs: updated.doneActs,
      nextIndex: updated.nextIndex,
      avgMinPerAct: updated.avgMinPerAct,
    },
    suggestedNext: suggestion,
  };

  state = readState();
  state.progressLog[reqId] = responseData;
  writeState(state);

  return NextResponse.json(responseData, {
    headers: { "Cache-Control": "no-store" },
  });
}
