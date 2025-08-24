import fs from 'fs';
import path from 'path';
import { Track } from './tracks';
import { DayStats, getDefaultDayStats } from './dayStats';
import { loadSettings } from './settings';

export interface State {
  tracks: Track[];
  dayStats: DayStats;
  requestCounts: Record<string, { date: string; count: number }>;
}

const DATA_DIR = path.resolve(process.env.DATA_DIR || '/gestor/system');
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
    requestCounts: {},
  };
}

export function loadState(): State {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
      const initial = createInitialState();
      fs.writeFileSync(STATE_FILE, JSON.stringify(initial, null, 2), {
        mode: 0o600,
      });
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
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), {
    mode: 0o600,
  });
}

export function incrementRequestCount(endpoint: string): boolean {
  const state = loadState();
  const today = new Date().toISOString().slice(0, 10);
  const entry = state.requestCounts[endpoint] || { date: today, count: 0 };
  if (entry.date !== today) {
    entry.date = today;
    entry.count = 0;
  }
  const { dailyLimit } = loadSettings();
  if (entry.count >= dailyLimit) {
    return false;
  }
  entry.count += 1;
  state.requestCounts[endpoint] = entry;
  saveState(state);
  return true;
}
