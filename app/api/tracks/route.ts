import { NextResponse } from "next/server";
import { readState, writeState, resetDayIfNeeded } from "../../../lib/state";

function daysUntil(dateStr: string): number {
  const today = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  return diff <= 0 ? 1 : diff;
}

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

  const state = readState();
  resetDayIfNeeded(state);
  writeState(state);

  const summaries = state.tracks.map((t) => {
    const daysLeft = daysUntil(t.classDate);
    const quota = Math.ceil(t.R / daysLeft);
    const H = state.dayStats.actsToday[t.slug] || 0;
    const deficit = quota - H;
    return {
      slug: t.slug,
      subject: t.subject,
      doneActs: t.doneActs,
      totalActs: t.doneActs + t.R,
      remain: t.R,
      dueDate: t.classDate,
      daysLeft,
      quota,
      deficit,
      avgMinPerAct: t.avgMinPerAct,
    };
  });

  return NextResponse.json(summaries, {
    headers: { "Cache-Control": "no-store" },
  });
}
