import { NextResponse } from "next/server";
import { loadState, incrementRequestCount } from "../../../lib/state";
import { Track } from "../../../lib/tracks";

function daysUntil(dateStr: string): number {
  const today = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  return diff <= 0 ? 1 : diff;
}

export async function GET(request: Request) {
  if (!incrementRequestCount("tracks")) {
    return new Response("Daily limit reached", { status: 429 });
  }
  const state = loadState();
  const result = state.tracks.map((t: Track) => {
    const daysLeft = daysUntil(t.classDate);
    const total = t.doneActs + t.R;
    const quota = Math.ceil(t.R / daysLeft);
    const deficit = quota - (state.dayStats.actsToday[t.slug] || 0);
    return {
      slug: t.slug,
      subject: t.subject,
      done: t.doneActs,
      total,
      classDate: t.classDate,
      daysLeft,
      quota,
      deficit,
      avgMinPerAct: t.avgMinPerAct,
      nextIndex: t.nextIndex,
      R: t.R,
    };
  });

  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
