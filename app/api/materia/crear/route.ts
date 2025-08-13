import { NextResponse } from 'next/server';
import { loadMaterias, saveMaterias } from '@/lib/materias';
import { checkRateLimit } from '@/lib/state';

export async function GET(request: Request) {
  if (!checkRateLimit('materia-crear')) {
    return new Response('Límite diario alcanzado', { status: 429, headers: { 'Cache-Control': 'no-store' } });
  }
  const { searchParams } = new URL(request.url);
  const data = searchParams.get('data');
  if (!data) {
    return NextResponse.json({ error: 'data required' }, { status: 400 });
  }
  const state = loadMaterias();
  const parts = data.split('-');
  if (parts.length !== 4) {
    return NextResponse.json({ error: 'data format: fecha-nombre-progreso-totaltareas' }, { status: 400 });
  }
  const [fecha, nombre, progresoStr, totalStr] = parts;
  const materia = {
    nombre,
    fecha,
    progreso: parseInt(progresoStr, 10),
    totaltareas: parseInt(totalStr, 10),
    minutos: 0,
  };
  state.materias.push(materia);
  saveMaterias(state);
  return NextResponse.json({ status: 'created', materia }, { headers: { 'Cache-Control': 'no-store' } });
}
