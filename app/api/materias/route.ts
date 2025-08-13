import { NextResponse } from 'next/server';
import { getSubjectSummaries } from '@/lib/subjects';
import { getStoredResponse, storeResponse } from '@/lib/state';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get('reqId');
  const ts = searchParams.get('ts');
  if (!reqId || !ts) {
    return NextResponse.json({ error: 'reqId and ts required' }, { status: 400 });
  }
  const cached = getStoredResponse('materias', reqId);
  if (cached) return NextResponse.json(cached);
  const data = getSubjectSummaries();
  storeResponse('materias', reqId, data);
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
