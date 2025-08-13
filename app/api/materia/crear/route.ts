import { NextResponse } from 'next/server';
import { loadMaterias, saveMaterias } from '@/lib/materias';
import { incrementRequestCount } from '@/lib/state';

export async function GET(request: Request) {
  if (!incrementRequestCount('materia-crear')) {
    return NextResponse.json({ error: 'Daily limit reached' }, { status: 429 });
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
  const response = { status: 'created', materia };
  return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
}
