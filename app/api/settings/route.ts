import { NextResponse } from 'next/server';
import { loadState, saveState } from '@/lib/state';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = loadState();
  const limitParam = searchParams.get('dailyLimit');
  if (limitParam) {
    const newLimit = parseInt(limitParam, 10);
    if (!isNaN(newLimit) && newLimit > 0) {
      state.settings.dailyLimit = newLimit;
      saveState(state);
    }
  }
  return NextResponse.json({ dailyLimit: state.settings.dailyLimit }, { headers: { 'Cache-Control': 'no-store' } });
}
