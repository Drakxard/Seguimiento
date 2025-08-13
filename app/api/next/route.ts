import { NextResponse } from 'next/server'
import { loadTracks, loadTodayLog } from '@/lib/tracks'
import { decideNext, defaultSettings } from '@/lib/decision'

export async function POST(request: Request) {
  const body = await request.json()
  const { slotMinutes, currentTrackSlug, forceSwitch } = body
  if (typeof slotMinutes !== 'number') {
    return NextResponse.json({ error: 'slotMinutes required' }, { status: 400 })
  }
  try {
    const tracks = await loadTracks()
    const logs = await loadTodayLog()
    const choice = decideNext(
      tracks,
      logs,
      slotMinutes,
      { currentTrackSlug, forceSwitch },
      defaultSettings
    )
    if (!choice) return new NextResponse(null, { status: 204 })
    return NextResponse.json(choice)
  } catch (err) {
    return NextResponse.json(
      { error: 'internal error', details: String(err) },
      { status: 500 }
    )
  }
}

