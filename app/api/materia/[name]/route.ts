import { NextResponse } from 'next/server';
import { loadMaterias, saveMaterias } from '@/lib/materias';

export async function GET(request: Request, { params }: { params: { name: string } }) {
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get('reqId');
  const ts = searchParams.get('ts');
  if (!reqId || !ts) {
    return NextResponse.json({ error: 'reqId and ts required' }, { status: 400 });
  }
  const sumar = searchParams.get('sumar');
  const prog = searchParams.get('progreso');
  const total = searchParams.get('totaltareas');
  const state = loadMaterias();
  if (state.reqLog[reqId]) {
    return NextResponse.json(state.reqLog[reqId], { headers: { 'Cache-Control': 'no-store' } });
  }
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
  const response = { ...materia };
  state.reqLog[reqId] = response;
  saveMaterias(state);
  return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
}
