import { NextResponse } from 'next/server'
import { loadTracks, loadLogs, suggestNext } from '@/lib/tracking'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { slotMinutes, currentTrackSlug, forceSwitch } = body || {}
    if (typeof slotMinutes !== 'number') {
      return NextResponse.json(
        { error: 'slotMinutes required' },
        { status: 400 }
      )
    }
    const tracks = await loadTracks()
    const logs = await loadLogs()
    const suggestion = suggestNext(
      tracks,
      logs,
      slotMinutes,
      currentTrackSlug,
      forceSwitch
    )
    if (!suggestion) return new NextResponse(null, { status: 204 })
    return NextResponse.json(suggestion)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
