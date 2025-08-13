import { Subject } from "./tracks";

export interface DayStats {
  date: string; // YYYY-MM-DD
  actsToday: Record<string, number>;
  minutesToday: Record<Subject, number>;
}

export function defaultDayStats(): DayStats {
  return {
    date: new Date().toISOString().slice(0, 10),
    actsToday: {},
    minutesToday: {
      "Álgebra": 0,
      "Cálculo": 0,
      POO: 0,
    },
  };
}

export function resetDayIfNeeded(ds: DayStats) {
  const today = new Date().toISOString().slice(0, 10);
  if (ds.date !== today) {
    ds.date = today;
    ds.actsToday = {};
    ds.minutesToday = {
      "Álgebra": 0,
      "Cálculo": 0,
      POO: 0,
    };
  }
}
