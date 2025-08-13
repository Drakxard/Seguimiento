import { NextResponse } from "next/server";
import { loadState, resetDayIfNeeded, saveState } from "../../../lib/state";

function daysUntil(dateStr: string): number {
  const today = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  return diff <= 0 ? 1 : diff;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reqId = url.searchParams.get("reqId");
  const ts = url.searchParams.get("ts");
  if (!reqId || !ts) {
    return NextResponse.json({ error: "missing reqId or ts" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const state = loadState();
  resetDayIfNeeded(state.dayStats);
  saveState();
  const { tracks, dayStats } = state;
  const rows = tracks.map((t) => {
    const daysLeft = daysUntil(t.classDate);
    const quota = Math.ceil(t.R / daysLeft);
    const H = dayStats.actsToday[t.slug] || 0;
    const deficit = quota - H;
    return {
      slug: t.slug,
      subject: t.subject,
      done: t.doneActs,
      total: t.doneActs + t.R,
      dueDate: t.classDate,
      daysLeft,
      quota,
      deficit,
      avgMinPerAct: t.avgMinPerAct,
      R: t.R,
    };
  });
  return NextResponse.json(rows, { headers: { "Cache-Control": "no-store" } });
}
