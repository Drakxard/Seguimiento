import { NextResponse } from 'next/server';
import { loadMaterias, saveMaterias } from '@/lib/materias';
import { checkRateLimit } from '@/lib/state';

export async function GET(request: Request, { params }: { params: { name: string } }) {
  if (!checkRateLimit('materia')) {
    return new Response('Límite diario alcanzado', { status: 429, headers: { 'Cache-Control': 'no-store' } });
  }
  const { searchParams } = new URL(request.url);
  const sumar = searchParams.get('sumar');
  const prog = searchParams.get('progreso');
  const total = searchParams.get('totaltareas');
  const state = loadMaterias();
  const materia = state.materias.find(m => m.nombre === params.name);
  if (!materia) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
  if (sumar) {
    materia.progreso += parseInt(sumar, 10);
  }
  if (prog) {
    materia.progreso += parseInt(prog, 10);
  }
  if (total) {
    materia.totaltareas = parseInt(total, 10);
  }
  saveMaterias(state);
  return NextResponse.json({ ...materia }, { headers: { 'Cache-Control': 'no-store' } });
}
