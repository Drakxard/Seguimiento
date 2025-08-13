import fs from 'fs';
import path from 'path';
import { Track } from './tracks';
import { DayStats, getDefaultDayStats } from './dayStats';

export interface State {
  tracks: Track[];
  dayStats: DayStats;
  reqLog: {
    next: Record<string, any>;
    progress: Record<string, any>;
    tracks: Record<string, any>;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

function createInitialState(): State {
  return {
    tracks: [
      {
        slug: 'algebra-t',
        subject: 'Álgebra',
        R: 5,
        classDate: '2025-08-17',
        nextIndex: 0,
        lastTouched: 0,
        avgMinPerAct: 50,
        active: true,
        doneActs: 0,
      },
      {
        slug: 'algebra-p',
        subject: 'Álgebra',
        R: 6,
        classDate: '2025-08-20',
        nextIndex: 0,
        lastTouched: 0,
        avgMinPerAct: 50,
        active: true,
        doneActs: 0,
      },
      {
        slug: 'poo-t',
        subject: 'POO',
        R: 1,
        classDate: '2025-08-18',
        nextIndex: 0,
        lastTouched: 0,
        avgMinPerAct: 50,
        active: true,
        doneActs: 0,
      },
      {
        slug: 'poo-p',
        subject: 'POO',
        R: 1,
        classDate: '2025-08-14',
        nextIndex: 0,
        lastTouched: 0,
        avgMinPerAct: 50,
        active: true,
        doneActs: 0,
      },
      {
        slug: 'calculo-p',
        subject: 'Cálculo',
        R: 1,
        classDate: '2025-08-18',
        nextIndex: 0,
        lastTouched: 0,
        avgMinPerAct: 50,
        active: true,
        doneActs: 0,
      },
      {
        slug: 'calculo-t',
        subject: 'Cálculo',
        R: 1,
        classDate: '2025-08-21',
        nextIndex: 0,
        lastTouched: 0,
        avgMinPerAct: 50,
        active: true,
        doneActs: 0,
      },
    ],
    dayStats: getDefaultDayStats(),
    reqLog: { next: {}, progress: {}, tracks: {} },
  };
}

export function loadState(): State {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const initial = createInitialState();
      fs.writeFileSync(STATE_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    // If reading fails, return a fresh state in memory
    return createInitialState();
  }
}

export function saveState(state: State) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function getStoredResponse(endpoint: keyof State['reqLog'], reqId: string) {
  const state = loadState();
  return state.reqLog[endpoint][reqId];
}

export function storeResponse(endpoint: keyof State['reqLog'], reqId: string, response: any) {
  const state = loadState();
  state.reqLog[endpoint][reqId] = response;
  saveState(state);
}
