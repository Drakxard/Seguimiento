import { NextResponse } from "next/server";
import { getNextSuggestion } from "../../../lib/scheduler";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get("reqId");
  const ts = searchParams.get("ts");
  if (!reqId || !ts) {
    return new Response("Missing reqId or ts", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }
  const slotMinutes = parseInt(searchParams.get("slotMinutes") || "50", 10);
  const currentTrack = searchParams.get("currentTrack") || undefined;
  const forceSwitch = searchParams.get("forceSwitch") === "1";
  const result = getNextSuggestion({
    slotMinutes,
    currentTrackSlug: currentTrack,
    forceSwitch,
  });
  if (!result)
    return new Response(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
