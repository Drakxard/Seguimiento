import fs from 'fs';
import path from 'path';

export type Subject = 'Álgebra' | 'Cálculo' | 'POO';

export interface Track {
  slug: string;
  subject: Subject;
  R: number; // remaining acts
  classDate: string; // ISO date
  nextIndex: number;
  lastTouched: number; // timestamp ms
  avgMinPerAct: number;
  active: boolean;
  doneActs: number;
}

export interface DayStats {
  date: string; // YYYY-MM-DD
  actsToday: Record<string, number>;
  minutesToday: Record<Subject, number>;
}

export interface Suggestion {
  trackSlug: string;
  nextIndex: number;
  plannedActs: number;
  plannedMinutes: number;
  reason: string;
  diagnostics: {
    deficit: number;
    daysLeft: number;
    remain: number;
    quota: number;
    score: number;
  };
}

export interface ProgressEntry {
  updatedTrack: {
    slug: string;
    doneActs: number;
    nextIndex: number;
    avgMinPerAct: number;
  };
  suggestedNext: Suggestion | null;
}

export interface State {
  tracks: Track[];
  dayStats: DayStats;
  progressLog: Record<string, ProgressEntry>;
}

const filePath = path.join(process.cwd(), 'data', 'state.json');

const initialState: State = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

export function readState(): State {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as State;
  } catch (e) {
    return initialState;
  }
}

export function writeState(state: State) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
}

export function resetDayIfNeeded(state: State) {
  const today = new Date().toISOString().slice(0, 10);
  if (state.dayStats.date !== today) {
    state.dayStats = {
      date: today,
      actsToday: {},
      minutesToday: { 'Álgebra': 0, 'Cálculo': 0, POO: 0 },
    };
  }
}
