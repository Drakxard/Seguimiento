import { NextResponse } from 'next/server';
import { loadMaterias, daysLeft } from '@/lib/materias';
import { checkRateLimit } from '@/lib/state';

export async function GET(request: Request) {
  if (!checkRateLimit('masdias')) {
    return new Response('Límite diario alcanzado', { status: 429, headers: { 'Cache-Control': 'no-store' } });
  }
  const state = loadMaterias();
  if (!state.materias.length) {
    return NextResponse.json(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  }
  const sorted = [...state.materias].sort((a, b) => daysLeft(b.fecha) - daysLeft(a.fecha));
  const materia = sorted[0];
  return NextResponse.json({ ...materia, diasRestantes: daysLeft(materia.fecha) }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
