import { NextResponse } from 'next/server';
import { loadMaterias, daysLeft } from '@/lib/materias';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get('reqId');
  const ts = searchParams.get('ts');
  if (!reqId || !ts) {
    return NextResponse.json({ error: 'reqId and ts required' }, { status: 400 });
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
