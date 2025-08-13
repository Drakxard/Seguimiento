import { NextResponse } from 'next/server'
import { chooseNext } from '../../../lib/tracks'

export async function POST(request: Request) {
  const body = await request.json()
  const { slotMinutes = 50, currentTrackSlug, forceSwitch } = body
  const suggestion = chooseNext(slotMinutes, currentTrackSlug, forceSwitch)
  if (!suggestion) return new Response(null, { status: 204 })
  return NextResponse.json(suggestion)
}
