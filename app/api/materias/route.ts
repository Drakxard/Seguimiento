import { NextResponse } from 'next/server';
import { loadMaterias, daysLeft } from '@/lib/materias';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reqId = searchParams.get('reqId');
  const ts = searchParams.get('ts');
  if (!reqId || !ts) {
    return NextResponse.json({ error: 'reqId and ts required' }, { status: 400 });
  }
  const state = loadMaterias();
  const list = state.materias.map(m => ({ ...m, diasRestantes: daysLeft(m.fecha) }));
  return NextResponse.json(list, { headers: { 'Cache-Control': 'no-store' } });
}
