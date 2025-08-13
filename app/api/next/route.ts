import { NextResponse } from "next/server";
import { getNextSuggestion } from "../../../lib/scheduler";
import { incrementRequestCount } from "../../../lib/state";

export async function GET(request: Request) {
  if (!incrementRequestCount("next")) {
    return new Response("Daily limit reached", { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const slotMinutes = parseInt(searchParams.get("slotMinutes") || "50", 10);
  const currentTrackSlug = searchParams.get("currentTrack")?.toLowerCase();
  const forceSwitch = searchParams.get("forceSwitch") === "1";

  const result = getNextSuggestion({
    slotMinutes,
    currentTrackSlug,
    forceSwitch,
  });

  if (!result) {
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
