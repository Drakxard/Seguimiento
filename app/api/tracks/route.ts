import { NextResponse } from "next/server"
import { tracks } from "../../../lib/tracks"
import { dayStats } from "../../../lib/dayStats"
import { daysUntil } from "../../../lib/scheduler"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reqId = searchParams.get("reqId")
  const ts = searchParams.get("ts")
  if (!reqId || !ts) {
    return new NextResponse("missing reqId or ts", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    })
  }
  const summary = tracks.map((t) => {
    const daysLeft = daysUntil(t.classDate)
    const quota = Math.ceil(t.R / Math.max(daysLeft, 1))
    const H = dayStats.actsToday[t.slug] || 0
    const deficit = quota - H
    return {
      slug: t.slug,
      subject: t.subject,
      done: t.doneActs,
      total: t.doneActs + t.R,
      remain: t.R,
      dueDate: t.classDate,
      daysLeft,
      quota,
      deficit,
      avgMinPerAct: t.avgMinPerAct,
    }
  })
  return NextResponse.json(summary, {
    headers: { "Cache-Control": "no-store" },
  })
}
