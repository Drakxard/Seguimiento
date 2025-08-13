import { NextResponse } from 'next/server';
import { loadMaterias, saveMaterias } from '@/lib/materias';
import { incrementRequestCount } from '@/lib/state';

export async function GET(request: Request, { params }: { params: { name: string } }) {
  if (!incrementRequestCount('materia-eliminar')) {
    return NextResponse.json({ error: 'Daily limit reached' }, { status: 429 });
  }
  const state = loadMaterias();
  const index = state.materias.findIndex(m => m.nombre === params.name);
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
  const [removed] = state.materias.splice(index, 1);
  saveMaterias(state);
  const response = { status: 'deleted', materia: removed };
  return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
}
