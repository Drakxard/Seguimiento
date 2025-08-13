import { NextResponse } from 'next/server';
import { getSubjectBy } from '@/lib/subjects';
import { getStoredResponse, storeResponse } from '@/lib/state';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get('reqId');
  const ts = searchParams.get('ts');
  if (!reqId || !ts) {
    return NextResponse.json({ error: 'reqId and ts required' }, { status: 400 });
  }
  const cached = getStoredResponse('masdias', reqId);
  if (cached) return NextResponse.json(cached);
  const data = getSubjectBy('daysLeft', 'max');
  storeResponse('masdias', reqId, data);
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
