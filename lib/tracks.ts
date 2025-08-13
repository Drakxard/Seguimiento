import { differenceInDays } from 'date-fns'

export type Subject = 'Álgebra' | 'Cálculo' | 'POO'

export interface Track {
  slug: string
  subject: Subject
  type: 'T' | 'P'
  R: number
  D: number
  lastTouched: string
  avgMinPerAct: number
  active: boolean
  doneActs: number
}

export interface DailyState {
  date: string
  actsToday: Record<string, number>
  minutesBySubject: Record<Subject, number>
}

export const B = 50
export const CMAX = 0.6
export const P_WINDOW = 48

export const tracks: Track[] = [
  {
    slug: 'algebra-t',
    subject: 'Álgebra',
    type: 'T',
    R: 6,
    D: 3,
    lastTouched: new Date().toISOString(),
    avgMinPerAct: 25,
    active: true,
    doneActs: 0,
  },
  {
    slug: 'algebra-p',
    subject: 'Álgebra',
    type: 'P',
    R: 4,
    D: 2,
    lastTouched: new Date().toISOString(),
    avgMinPerAct: 20,
    active: true,
    doneActs: 0,
  },
  {
    slug: 'calculo-t',
    subject: 'Cálculo',
    type: 'T',
    R: 5,
    D: 4,
    lastTouched: new Date().toISOString(),
    avgMinPerAct: 25,
    active: true,
    doneActs: 0,
  },
  {
    slug: 'poo-t',
    subject: 'POO',
    type: 'T',
    R: 3,
    D: 5,
    lastTouched: new Date().toISOString(),
    avgMinPerAct: 30,
    active: true,
    doneActs: 0,
  },
]

export let daily: DailyState = {
  date: new Date().toISOString().slice(0, 10),
  actsToday: {},
  minutesBySubject: { 'Álgebra': 0, 'Cálculo': 0, 'POO': 0 },
}

function ensureToday() {
  const today = new Date().toISOString().slice(0, 10)
  if (daily.date !== today) {
    daily = {
      date: today,
      actsToday: {},
      minutesBySubject: { 'Álgebra': 0, 'Cálculo': 0, 'POO': 0 },
    }
  }
}

interface Suggestion {
  trackSlug: string
  nextIndex: number
  plannedActs: number
  plannedMinutes: number
  reason: string
  diagnostics: { delta: number; D: number; R: number; cuota: number; score: number }
}

export function chooseNext(
  slotMinutes: number,
  currentTrackSlug?: string,
  forceSwitch?: boolean,
): Suggestion | null {
  ensureToday()
  const now = new Date()

  if (currentTrackSlug && !forceSwitch) {
    const track = tracks.find((t) => t.slug === currentTrackSlug && t.active && t.R > 0)
    if (track) {
      const plannedActs = Math.max(1, Math.min(track.R, Math.floor(slotMinutes / track.avgMinPerAct)))
      const plannedMinutes = plannedActs * track.avgMinPerAct
      return {
        trackSlug: track.slug,
        nextIndex: track.doneActs,
        plannedActs,
        plannedMinutes,
        reason: `${track.subject} ${track.type} · continuación`,
        diagnostics: { delta: 0, D: track.D, R: track.R, cuota: 0, score: 0 },
      }
    }
  }

  const totalMinutesToday = Object.values(daily.minutesBySubject).reduce((a, b) => a + b, 0)

  const candidates = tracks.filter((t) => t.active && t.R > 0)
  if (candidates.length === 0) return null

  const subjectDeficits = new Map<Subject, number>()
  ;['Álgebra', 'Cálculo', 'POO'].forEach((s) => {
    subjectDeficits.set(s as Subject, B - (daily.minutesBySubject[s as Subject] || 0))
  })
  const needCoverage = Array.from(subjectDeficits.entries()).filter(([, def]) => def > 0)

  let selected: Track | null = null
  let deficitFlag = false
  let selectedDelta = 0
  let selectedCuota = 0
  let selectedScore = 0

  if (needCoverage.length > 0) {
    needCoverage.sort((a, b) => b[1] - a[1])
    const targetSubject = needCoverage[0][0]
    const tracksBySubject = candidates.filter((t) => t.subject === targetSubject)
    tracksBySubject.sort(
      (a, b) =>
        a.D - b.D || new Date(a.lastTouched).getTime() - new Date(b.lastTouched).getTime(),
    )
    selected = tracksBySubject[0] || null
    deficitFlag = true
  } else {
    const withDelta = candidates.map((t) => {
      const cuota = Math.ceil(t.R / t.D)
      const H = daily.actsToday[t.slug] || 0
      const delta = cuota - H
      const bonus = t.D <= 1 ? 100 : t.D <= 3 ? 50 : 0
      const coolBonus = differenceInDays(now, new Date(t.lastTouched)) * 0.01
      const score = t.R / t.D + bonus + coolBonus
      return { ...t, cuota, delta, score }
    })

    const withPositiveDelta = withDelta.filter((t) => t.delta > 0)

    const sorted = (withPositiveDelta.length > 0 ? withPositiveDelta : withDelta).sort((a, b) => {
      if (withPositiveDelta.length > 0)
        return (
          b.delta - a.delta ||
          a.D - b.D ||
          new Date(a.lastTouched).getTime() - new Date(b.lastTouched).getTime()
        )
      return (
        b.score - a.score ||
        a.D - b.D ||
        new Date(a.lastTouched).getTime() - new Date(b.lastTouched).getTime()
      )
    })

    for (const t of sorted) {
      const subjectMinutes = daily.minutesBySubject[t.subject] || 0
      if (
        (subjectMinutes + slotMinutes) / (totalMinutesToday + slotMinutes) > CMAX &&
        !(t.D <= 1 && t.R > 0)
      ) {
        continue
      }
      selected = t
      selectedDelta = t.delta
      selectedCuota = t.cuota
      selectedScore = t.score
      break
    }
  }

  if (!selected) return null

  const plannedActs = Math.max(1, Math.min(selected.R, Math.floor(slotMinutes / selected.avgMinPerAct)))
  const plannedMinutes = plannedActs * selected.avgMinPerAct
  const reasonPieces: string[] = [`${selected.subject} ${selected.type}`]
  reasonPieces.push(selectedDelta > 0 ? 'déficit' : 'sin déficit')
  reasonPieces.push(`clase en ${selected.D} días`)
  if (deficitFlag) reasonPieces.push('+ cobertura')
  const reason = reasonPieces.join(' · ')

  return {
    trackSlug: selected.slug,
    nextIndex: selected.doneActs,
    plannedActs,
    plannedMinutes,
    reason,
    diagnostics: {
      delta: selectedDelta,
      D: selected.D,
      R: selected.R,
      cuota: selectedCuota,
      score: selectedScore,
    },
  }
}

export function registerProgress(trackSlug: string, minutesSpent: number, actsDone: number) {
  ensureToday()
  const track = tracks.find((t) => t.slug === trackSlug)
  if (!track) return null
  track.R = Math.max(0, track.R - actsDone)
  track.doneActs += actsDone
  track.lastTouched = new Date().toISOString()
  const perAct = minutesSpent / actsDone
  track.avgMinPerAct = 0.7 * track.avgMinPerAct + 0.3 * perAct
  daily.actsToday[trackSlug] = (daily.actsToday[trackSlug] || 0) + actsDone
  daily.minutesBySubject[track.subject] += minutesSpent
  return track
}

