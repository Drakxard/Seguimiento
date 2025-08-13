import fs from 'fs';
import path from 'path';
import { Track } from './tracks';
import { DayStats, getDefaultDayStats } from './dayStats';

export interface State {
  tracks: Track[];
  dayStats: DayStats;
  reqCounts: Record<string, { date: string; count: number }>;
  settings: { dailyLimit: number };
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
    reqCounts: {},
    settings: { dailyLimit: 100 },
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
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch {
    // ignore write errors on read-only file systems
  }
}

export function checkRateLimit(endpoint: string): boolean {
  const state = loadState();
  const today = new Date().toISOString().slice(0, 10);
  const info = state.reqCounts[endpoint] || { date: today, count: 0 };
  if (info.date !== today) {
    info.date = today;
    info.count = 0;
  }
  if (info.count >= state.settings.dailyLimit) {
    return false;
  }
  info.count += 1;
  state.reqCounts[endpoint] = info;
  saveState(state);
  return true;
}

export function updateDailyLimit(limit: number) {
  const state = loadState();
  state.settings.dailyLimit = limit;
  saveState(state);
}
