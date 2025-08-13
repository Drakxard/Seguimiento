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

const FILES = [
  path.join(process.cwd(), 'data', 'state.json'),
  path.join('/tmp', 'state.json')
];

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
  for (const file of FILES) {
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        return JSON.parse(raw);
      }
    } catch {
      // ignore and try next option
    }
  }
  return createInitialState();
}

export function saveState(state: State) {
  const content = JSON.stringify(state, null, 2);
  for (const file of FILES) {
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content);
      return;
    } catch {
      // ignore and try next path
    }
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
