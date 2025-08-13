import { NextResponse } from "next/server";
import { getNextSuggestion } from "../../../lib/scheduler";
import { getStoredResponse, storeResponse } from "../../../lib/state";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get("reqId");
  const ts = searchParams.get("ts");
  if (!reqId || !ts) {
    return new Response("Missing reqId or ts", { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const cached = getStoredResponse("next", reqId);
  if (cached !== undefined) {
    if (cached === null) return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json(cached, { headers: { "Cache-Control": "no-store" } });
  }

  const slotMinutes = parseInt(searchParams.get("slotMinutes") || "50", 10);
  const currentTrackSlug = searchParams.get("currentTrack")?.toLowerCase();
  const forceSwitch = searchParams.get("forceSwitch") === "1";

  const result = getNextSuggestion({
    slotMinutes,
    currentTrackSlug,
    forceSwitch,
  });

  storeResponse("next", reqId, result);

  if (!result) {
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
