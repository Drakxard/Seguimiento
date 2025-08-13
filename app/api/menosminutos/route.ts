import { NextResponse } from 'next/server';
import { loadMaterias } from '@/lib/materias';
import { incrementRequestCount } from '@/lib/state';

export async function GET() {
  if (!incrementRequestCount('menosminutos')) {
    return NextResponse.json({ error: 'Daily limit reached' }, { status: 429 });
  }
  const state = loadMaterias();
  if (!state.materias.length) {
    return NextResponse.json(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  }
  const sorted = [...state.materias].sort((a, b) => a.minutos - b.minutos);
  const materia = sorted[0];
  return NextResponse.json(materia, { headers: { 'Cache-Control': 'no-store' } });
}
