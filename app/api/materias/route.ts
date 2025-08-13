import { NextResponse } from 'next/server';
import { loadMaterias, daysLeft } from '@/lib/materias';
import { checkRateLimit } from '@/lib/state';

export async function GET(request: Request) {
  if (!checkRateLimit('materias')) {
    return new Response('Límite diario alcanzado', { status: 429, headers: { 'Cache-Control': 'no-store' } });
  }
  const state = loadMaterias();
  const list = state.materias.map(m => ({ ...m, diasRestantes: daysLeft(m.fecha) }));
  return NextResponse.json(list, { headers: { 'Cache-Control': 'no-store' } });
}
