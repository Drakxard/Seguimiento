import { NextResponse } from 'next/server';
import { loadMaterias, daysLeft } from '@/lib/materias';
import { incrementRequestCount } from '@/lib/state';

export async function GET() {
  if (!incrementRequestCount('menosdias')) {
    return NextResponse.json({ error: 'Daily limit reached' }, { status: 429 });
  }
  const state = loadMaterias();
  if (!state.materias.length) {
    return NextResponse.json(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  }
  const sorted = [...state.materias].sort((a, b) => daysLeft(a.fecha) - daysLeft(b.fecha));
  const materia = sorted[0];
  return NextResponse.json({ ...materia, diasRestantes: daysLeft(materia.fecha) }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
