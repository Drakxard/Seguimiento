import { NextResponse } from 'next/server'
import {
  recordProgress,
  suggestNext,
} from '@/lib/tracking'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { trackSlug, minutesSpent, activityId, nextIndex } = body || {}
    if (!trackSlug) {
      return NextResponse.json({ error: 'trackSlug required' }, { status: 400 })
    }
    let updated
    try {
      updated = await recordProgress(trackSlug, minutesSpent, nextIndex)
    } catch (e: any) {
      if (e.message === 'track complete') {
        return NextResponse.json({ error: 'vector completo' }, { status: 409 })
      }
      return NextResponse.json({ error: 'track not found' }, { status: 400 })
    }
    const { track, tracks, logs } = updated
    const suggestion = suggestNext(
      tracks,
      logs,
      typeof minutesSpent === 'number' ? minutesSpent : track.avgMinPerAct,
      track.trackSlug
    )
    return NextResponse.json({ updatedTrack: track, suggestedNext: suggestion })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
