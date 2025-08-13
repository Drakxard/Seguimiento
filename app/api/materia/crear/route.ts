import { NextResponse } from 'next/server';
import { loadState, saveState, getStoredResponse, storeResponse } from '@/lib/state';

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get('reqId');
  const ts = searchParams.get('ts');
  const data = searchParams.get('data');
  if (!reqId || !ts || !data) {
    return NextResponse.json({ error: 'reqId, ts and data required' }, { status: 400 });
  }
  const cached = getStoredResponse('materia-crear', reqId);
  if (cached) return NextResponse.json(cached);
  const [fecha, nombre, progresoStr, totalStr] = data.split('-');
  const progreso = parseInt(progresoStr);
  const total = parseInt(totalStr);
  const slug = slugify(nombre);
  const state = loadState();
  state.tracks.push({
    slug,
    subject: nombre,
    R: Math.max(0, total - progreso),
    classDate: fecha,
    nextIndex: progreso,
    lastTouched: 0,
    avgMinPerAct: 50,
    active: true,
    doneActs: progreso,
  });
  saveState(state);
  const created = state.tracks.find(t => t.slug === slug);
  storeResponse('materia-crear', reqId, created);
  return NextResponse.json(created, { headers: { 'Cache-Control': 'no-store' } });
}
