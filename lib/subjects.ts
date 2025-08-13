import { loadState } from './state';

export interface SubjectSummary {
  subject: string;
  daysLeft: number;
  minutes: number;
  totalTasks: number;
}

export function getSubjectSummaries(): SubjectSummary[] {
  const state = loadState();
  const map: Record<string, SubjectSummary> = {};
  const now = Date.now();
  for (const track of state.tracks) {
    const daysLeft = Math.ceil((new Date(track.classDate).getTime() - now) / 86400000);
    const total = track.doneActs + track.R;
    const existing = map[track.subject];
    if (!existing) {
      map[track.subject] = {
        subject: track.subject,
        daysLeft,
        minutes: state.dayStats.minutesToday[track.subject] || 0,
        totalTasks: total,
      };
    } else {
      existing.daysLeft = Math.min(existing.daysLeft, daysLeft);
      existing.totalTasks += total;
    }
  }
  return Object.values(map);
}

export function getSubjectBy(field: keyof SubjectSummary, dir: 'min' | 'max'): SubjectSummary | null {
  const list = getSubjectSummaries();
  if (list.length === 0) return null;
  return list.reduce((prev, curr) => {
    return dir === 'min'
      ? (curr[field] < prev[field] ? curr : prev)
      : (curr[field] > prev[field] ? curr : prev);
  });
}
