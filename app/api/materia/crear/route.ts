import { NextResponse } from 'next/server';
import { loadMaterias, saveMaterias } from '@/lib/materias';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get('reqId');
  const ts = searchParams.get('ts');
  const data = searchParams.get('data');
  if (!reqId || !ts || !data) {
    return NextResponse.json({ error: 'reqId, ts and data required' }, { status: 400 });
  }
  const state = loadMaterias();
  if (state.reqLog[reqId]) {
    return NextResponse.json(state.reqLog[reqId], { headers: { 'Cache-Control': 'no-store' } });
  }
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
  const response = { status: 'created', materia };
  state.reqLog[reqId] = response;
  saveMaterias(state);
  return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
}
