// @ts-nocheck
import { NextResponse } from 'next/server'
import { selectNext } from '../../../lib/tracks'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slotMinutes = 60, currentTrackSlug, forceSwitch } = body
    const suggestion = selectNext({ slotMinutes, currentTrackSlug, forceSwitch })
    if (!suggestion) return NextResponse.json({}, { status: 204 })
    return NextResponse.json(suggestion)
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'error' }, { status: 500 })
  }
}
