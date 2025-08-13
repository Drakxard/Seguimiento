import { NextResponse } from 'next/server';
import { loadMaterias } from '@/lib/materias';
import { checkRateLimit } from '@/lib/state';

export async function GET(request: Request) {
  if (!checkRateLimit('mastareas')) {
    return new Response('Límite diario alcanzado', { status: 429, headers: { 'Cache-Control': 'no-store' } });
  }
  const state = loadMaterias();
  if (!state.materias.length) {
    return NextResponse.json(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  }
  const sorted = [...state.materias].sort((a, b) => b.totaltareas - a.totaltareas);
  const materia = sorted[0];
  return NextResponse.json(materia, { headers: { 'Cache-Control': 'no-store' } });
}
