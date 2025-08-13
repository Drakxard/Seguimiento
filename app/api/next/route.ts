import { NextResponse } from "next/server";
import { getNextSuggestion } from "../../../lib/scheduler";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reqId = url.searchParams.get("reqId");
  const ts = url.searchParams.get("ts");
  if (!reqId || !ts) {
    return NextResponse.json({ error: "missing reqId or ts" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const slotMinutes = parseInt(url.searchParams.get("slotMinutes") || "50", 10);
  const currentTrack = url.searchParams.get("currentTrack") || undefined;
  const forceSwitch = url.searchParams.get("forceSwitch") === "1";
  const result = getNextSuggestion({
    slotMinutes,
    currentTrackSlug: currentTrack,
    forceSwitch,
  });
  if (!result)
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
