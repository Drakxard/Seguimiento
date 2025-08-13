import { readState, writeState, resetDayIfNeeded, Track, Subject, Suggestion } from './state';

const B = 50; // cobertura mínima por materia
const CMAX = 0.6; // 60%
const PRACTICE_WINDOW_H = 48; // ventana de práctica

function daysUntil(dateStr: string): number {
  const today = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  return diff <= 0 ? 1 : diff;
}

function eventBonus(D: number): number {
  if (D <= 1) return 1; // fuerte ≤24h
  if (D <= 3) return 0.5; // moderado ≤72h
  return 0;
}

function cooldownBonus(lastTouched: number): number {
  if (!lastTouched) return 0.1;
  const days = (Date.now() - lastTouched) / 86400000;
  return days * 0.01;
}

interface SuggestParams {
  slotMinutes: number;
  currentTrackSlug?: string;
  forceSwitch?: boolean;
}

export function getNextSuggestion(params: SuggestParams): Suggestion | null {
  const state = readState();
  resetDayIfNeeded(state);
  writeState(state);

  const { slotMinutes, currentTrackSlug, forceSwitch } = params;
  const tracks = state.tracks;
  const dayStats = state.dayStats;

  // compromiso de bloque
  if (currentTrackSlug && !forceSwitch) {
    const current = tracks.find((t) => t.slug === currentTrackSlug);
    if (current && current.active && current.R > 0) {
      const emergency = tracks.some(
        (t) => t.slug !== currentTrackSlug && t.active && t.R > 0 && daysUntil(t.classDate) <= 1,
      );
      if (!emergency) {
        const D = daysUntil(current.classDate);
        const Q = Math.ceil(current.R / D);
        const H = dayStats.actsToday[current.slug] || 0;
        const delta = Q - H;
        const pressure = current.R / D + eventBonus(D) + cooldownBonus(current.lastTouched);
        return buildSuggestion(
          current,
          slotMinutes,
          `${current.subject} · continuar bloque · clase en ${D} días`,
          { delta, D, R: current.R, cuota: Q, score: pressure },
        );
      }
    }
  }

  let candidates = tracks.filter((t) => t.active && t.R > 0);
  if (candidates.length === 0) return null;

  const subjectDeficits: Record<Subject, number> = {
    'Álgebra': Math.max(0, B - dayStats.minutesToday['Álgebra']),
    'Cálculo': Math.max(0, B - dayStats.minutesToday['Cálculo']),
    POO: Math.max(0, B - dayStats.minutesToday.POO),
  };
  const maxDeficit = Math.max(...Object.values(subjectDeficits));
  let coverageSubjects: Subject[] = [];
  if (maxDeficit > 0) {
    coverageSubjects = (Object.keys(subjectDeficits) as Subject[]).filter(
      (s) => subjectDeficits[s] === maxDeficit,
    );
    candidates = candidates.filter((t) => coverageSubjects.includes(t.subject));
  }

  const evaluated = candidates.map((t) => {
    const D = daysUntil(t.classDate);
    const Q = Math.ceil(t.R / D);
    const H = dayStats.actsToday[t.slug] || 0;
    const delta = Q - H;
    const pressure = t.R / D + eventBonus(D) + cooldownBonus(t.lastTouched);
    return { t, D, Q, H, delta, pressure };
  });

  const totalMinutes = Object.values(dayStats.minutesToday).reduce((a, b) => a + b, 0);
  const overCmax: Subject[] = [];
  if (totalMinutes > 0) {
    (Object.keys(dayStats.minutesToday) as Subject[]).forEach((s) => {
      if (dayStats.minutesToday[s] / totalMinutes > CMAX) overCmax.push(s);
    });
  }

  const candidates2 = evaluated.filter((e) => {
    if (overCmax.includes(e.t.subject) && !(e.D <= 1 && e.t.R > 0)) {
      return false;
    }
    return true;
  });
  if (candidates2.length === 0) return null;

  let choice = candidates2[0];
  let reason = '';
  if (maxDeficit > 0) {
    candidates2.sort(
      (a, b) => b.delta - a.delta || a.D - b.D || (a.t.lastTouched || 0) - (b.t.lastTouched || 0),
    );
    choice = candidates2[0];
    reason = `${choice.t.subject} · déficit · clase en ${choice.D} días · + cobertura`;
  } else {
    const maxDelta = Math.max(...candidates2.map((c) => c.delta));
    if (maxDelta > 0) {
      const pool = candidates2
        .filter((c) => c.delta === maxDelta)
        .sort((a, b) => a.D - b.D || (a.t.lastTouched || 0) - (b.t.lastTouched || 0));
      choice = pool[0];
      reason = `${choice.t.subject} · déficit · clase en ${choice.D} días`;
    } else {
      candidates2.sort(
        (a, b) => b.pressure - a.pressure || a.D - b.D || (a.t.lastTouched || 0) - (b.t.lastTouched || 0),
      );
      choice = candidates2[0];
      reason = `${choice.t.subject} · sin déficit · clase en ${choice.D} días`;
      if (maxDeficit === 0 && (Date.now() - choice.t.lastTouched) / 3600000 >= PRACTICE_WINDOW_H) {
        reason += ' · + práctica ≤48 h';
      }
    }
  }

  return buildSuggestion(choice.t, slotMinutes, reason, {
    delta: choice.delta,
    D: choice.D,
    R: choice.t.R,
    cuota: choice.Q,
    score: choice.pressure,
  });
}

function buildSuggestion(
  track: Track,
  slotMinutes: number,
  reason: string,
  diag: { delta: number; D: number; R: number; cuota: number; score: number },
): Suggestion {
  const plannedActs = Math.max(1, Math.floor(slotMinutes / track.avgMinPerAct));
  const acts = Math.min(track.R, plannedActs);
  const plannedMinutes = Math.round(acts * track.avgMinPerAct);
  return {
    trackSlug: track.slug,
    nextIndex: track.nextIndex,
    plannedActs: acts,
    plannedMinutes,
    reason,
    diagnostics: {
      deficit: diag.delta,
      daysLeft: diag.D,
      remain: diag.R,
      quota: diag.cuota,
      score: diag.score,
    },
  };
}

export function registerProgress(
  trackSlug: string,
  minutesSpent?: number,
  nextIndex?: number,
) {
  const state = readState();
  resetDayIfNeeded(state);
  const track = state.tracks.find((t) => t.slug === trackSlug);
  if (!track) return null;
  track.lastTouched = Date.now();
  track.doneActs += 1;
  track.R = Math.max(0, track.R - 1);
  track.nextIndex = typeof nextIndex === 'number' ? nextIndex : track.nextIndex + 1;
  if (minutesSpent) {
    state.dayStats.minutesToday[track.subject] += minutesSpent;
    track.avgMinPerAct = track.avgMinPerAct * 0.7 + minutesSpent * 0.3;
  }
  state.dayStats.actsToday[track.slug] = (state.dayStats.actsToday[track.slug] || 0) + 1;
  writeState(state);
  return track;
}
