import { Subject } from "./tracks";

export interface DayStats {
  date: string; // YYYY-MM-DD
  actsToday: Record<string, number>;
  minutesToday: Record<Subject, number>;
}

export const dayStats: DayStats = {
  date: new Date().toISOString().slice(0, 10),
  actsToday: {},
  minutesToday: {
    "Álgebra": 0,
    "Cálculo": 0,
    POO: 0,
  },
};

export function resetDayIfNeeded() {
  const today = new Date().toISOString().slice(0, 10);
  if (dayStats.date !== today) {
    dayStats.date = today;
    dayStats.actsToday = {};
    dayStats.minutesToday = {
      "Álgebra": 0,
      "Cálculo": 0,
      POO: 0,
    };
  }
}
