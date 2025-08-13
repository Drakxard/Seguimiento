import { NextResponse } from 'next/server'
import {
  appendLog,
  loadTodayLog,
  loadTracks,
  saveTracks,
} from '@/lib/tracks'
import { decideNext, defaultSettings } from '@/lib/decision'

export async function POST(request: Request) {
  const body = await request.json()
  const { trackSlug, minutesSpent } = body
  if (!trackSlug) {
    return NextResponse.json({ error: 'trackSlug required' }, { status: 400 })
  }
  try {
    const tracks = await loadTracks()
    const track = tracks.find((t) => t.slug === trackSlug)
    if (!track) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (track.doneActs >= track.totalActs) {
      return NextResponse.json({ error: 'vector complete' }, { status: 409 })
    }
    track.doneActs += 1
    track.nextIndex += 1
    track.lastTouched = new Date().toISOString()
    if (typeof minutesSpent === 'number') {
      track.avgMinPerAct = track.avgMinPerAct * 0.7 + minutesSpent * 0.3
      await appendLog({
        date: new Date().toISOString(),
        trackSlug,
        minutes: minutesSpent,
      })
    }
    await saveTracks(tracks)
    const logs = await loadTodayLog()
    const suggested = decideNext(tracks, logs, 60, {}, defaultSettings)
    return NextResponse.json({ updatedTrack: track, suggestedNext: suggested })
  } catch (err) {
    return NextResponse.json(
      { error: 'internal error', details: String(err) },
      { status: 500 }
    )
  }
}

