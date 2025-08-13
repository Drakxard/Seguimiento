import { NextResponse } from 'next/server';
import { loadMaterias, daysLeft } from '@/lib/materias';
import { incrementRequestCount } from '@/lib/state';

export async function GET() {
  if (!incrementRequestCount('materias')) {
    return NextResponse.json({ error: 'Daily limit reached' }, { status: 429 });
  }
  const state = loadMaterias();
  const list = state.materias.map(m => ({ ...m, diasRestantes: daysLeft(m.fecha) }));
  return NextResponse.json(list, { headers: { 'Cache-Control': 'no-store' } });
}
