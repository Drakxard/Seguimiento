// @ts-nocheck
import { NextResponse } from 'next/server'
import { recordProgress, selectNext } from '../../../lib/tracks'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { trackSlug, minutesSpent } = body
    if (!trackSlug) {
      return NextResponse.json({ error: 'trackSlug required' }, { status: 400 })
    }
    const updated = recordProgress({ trackSlug, minutesSpent })
    const suggestedNext = selectNext({ slotMinutes: minutesSpent || 60 })
    return NextResponse.json({ updatedTrack: updated, suggestedNext })
  } catch (e:any) {
    if (e.message === 'Track complete') {
      return NextResponse.json({ error: 'track complete' }, { status: 409 })
    }
    return NextResponse.json({ error: e.message || 'error' }, { status: 500 })
  }
}
