import { NextResponse } from 'next/server'
import { registerProgress, chooseNext } from '../../../lib/tracks'

export async function POST(request: Request) {
  const body = await request.json()
  const { trackSlug, minutesSpent = 0, actsDone = 1 } = body
  const updated = registerProgress(trackSlug, minutesSpent, actsDone)
  if (!updated) return NextResponse.json({ error: 'Track not found' }, { status: 404 })
  const suggestedNext = chooseNext(minutesSpent)
  return NextResponse.json({ updatedTrack: updated, suggestedNext })
}
