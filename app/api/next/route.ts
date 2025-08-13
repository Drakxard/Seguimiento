import { NextResponse } from "next/server";
import { getNextSuggestion } from "../../../lib/scheduler";

export async function POST(request: Request) {
  const body = await request.json();
  const { slotMinutes, currentTrackSlug, forceSwitch } = body;
  const result = getNextSuggestion({
    slotMinutes: slotMinutes ?? 50,
    currentTrackSlug,
    forceSwitch,
  });
  if (!result) return new Response(null, { status: 204 });
  return NextResponse.json(result);
}
