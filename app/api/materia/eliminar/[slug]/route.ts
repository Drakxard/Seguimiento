import { NextResponse } from 'next/server';
import { loadState, saveState, getStoredResponse, storeResponse } from '@/lib/state';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get('reqId');
  const ts = searchParams.get('ts');
  if (!reqId || !ts) {
    return NextResponse.json({ error: 'reqId and ts required' }, { status: 400 });
  }
  const cacheKey = `materia-eliminar-${params.slug}`;
  const cached = getStoredResponse(cacheKey, reqId);
  if (cached) return NextResponse.json(cached);
  const state = loadState();
  const index = state.tracks.findIndex(t => t.slug === params.slug);
  if (index === -1) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const removed = state.tracks.splice(index, 1)[0];
  saveState(state);
  storeResponse(cacheKey, reqId, removed);
  return NextResponse.json(removed, { headers: { 'Cache-Control': 'no-store' } });
}
