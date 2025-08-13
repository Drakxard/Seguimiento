import { NextResponse } from 'next/server';
import { loadMaterias, saveMaterias } from '@/lib/materias';
import { checkRateLimit } from '@/lib/state';

export async function GET(request: Request, { params }: { params: { name: string } }) {
  if (!checkRateLimit('materia-eliminar')) {
    return new Response('Límite diario alcanzado', { status: 429, headers: { 'Cache-Control': 'no-store' } });
  }
  const state = loadMaterias();
  const index = state.materias.findIndex(m => m.nombre === params.name);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
  const [removed] = state.materias.splice(index, 1);
  saveMaterias(state);
  return NextResponse.json({ status: 'deleted', materia: removed }, { headers: { 'Cache-Control': 'no-store' } });
}
