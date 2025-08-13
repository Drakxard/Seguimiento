import { NextResponse } from 'next/server';
import { loadState, saveState, getStoredResponse, storeResponse } from '@/lib/state';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get('reqId');
  const ts = searchParams.get('ts');
  if (!reqId || !ts) {
    return NextResponse.json({ error: 'reqId and ts required' }, { status: 400 });
  }
  const cacheKey = `materia-${params.slug}`;
  const cached = getStoredResponse(cacheKey, reqId);
  if (cached) return NextResponse.json(cached);

  const state = loadState();
  const track = state.tracks.find(t => t.slug === params.slug);
  if (!track) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const sumar = parseInt(searchParams.get('sumar') || '0');
  const progreso = parseInt(searchParams.get('progreso') || '0');
  const totalTareas = searchParams.get('totaltareas');
  let changed = false;
  const inc = sumar || progreso;
  if (inc) {
    track.doneActs += inc;
    track.R = Math.max(0, track.R - inc);
    changed = true;
  }
  if (totalTareas) {
    const total = parseInt(totalTareas);
    track.R = Math.max(0, total - track.doneActs);
    changed = true;
  }
  if (changed) {
    saveState(state);
  }
  storeResponse(cacheKey, reqId, track);
  return NextResponse.json(track, { headers: { 'Cache-Control': 'no-store' } });
}
