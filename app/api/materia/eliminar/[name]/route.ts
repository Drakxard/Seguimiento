import { NextResponse } from 'next/server';
import { loadMaterias, saveMaterias } from '@/lib/materias';

export async function GET(request: Request, { params }: { params: { name: string } }) {
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get('reqId');
  const ts = searchParams.get('ts');
  if (!reqId || !ts) {
    return NextResponse.json({ error: 'reqId and ts required' }, { status: 400 });
  }
  const state = loadMaterias();
  if (state.reqLog[reqId]) {
    return NextResponse.json(state.reqLog[reqId], { headers: { 'Cache-Control': 'no-store' } });
  }
  const index = state.materias.findIndex(m => m.nombre === params.name);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
  const [removed] = state.materias.splice(index, 1);
  const response = { status: 'deleted', materia: removed };
  state.reqLog[reqId] = response;
  saveMaterias(state);
  return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
}
