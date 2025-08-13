import { differenceInCalendarDays, parseISO } from 'date-fns'
import { Track, LogEntry } from './tracks'

export interface Settings {
  B: number // daily coverage minutes per base
  Cmax: number // max concentration per base (fraction 0-1)
  practiceWindowHours: number
  strongEventHours: number
  moderateEventHours: number
}

export const defaultSettings: Settings = {
  B: 50,
  Cmax: 0.6,
  practiceWindowHours: 48,
  strongEventHours: 24,
  moderateEventHours: 72,
}

export interface Choice {
  trackSlug: string
  nextIndex: number
  plannedActs: number
  plannedMinutes: number
  reason: string
  diagnostics: {
    deficit: number
    daysRemaining: number
    remaining: number
    quota: number
    score: number
  }
}

interface Metrics {
  R: number
  D: number
  Q: number
  H: number
  delta: number
  lastGap: number
  minutesBase: number
  pressure: number
}

export function decideNext(
  tracks: Track[],
  logs: LogEntry[],
  slotMinutes: number,
  options: { currentTrackSlug?: string; forceSwitch?: boolean } = {},
  settings: Settings = defaultSettings
): Choice | null {
  const today = new Date()

  // map logs
  const actsToday = new Map<string, number>()
  const minutesByBase = new Map<string, number>()
  let totalMinutes = 0
  for (const log of logs) {
    actsToday.set(log.trackSlug, (actsToday.get(log.trackSlug) || 0) + 1)
    const track = tracks.find((t) => t.slug === log.trackSlug)
    if (track) {
      const baseMin = minutesByBase.get(track.base) || 0
      minutesByBase.set(track.base, baseMin + log.minutes)
      totalMinutes += log.minutes
    }
  }

  // handle block commitment
  if (
    options.currentTrackSlug &&
    !options.forceSwitch
  ) {
    const current = tracks.find((t) => t.slug === options.currentTrackSlug)
    if (current) {
      const emergency = tracks.some((t) => {
        if (t.slug === current.slug) return false
        const R = t.totalActs - t.doneActs
        if (R <= 0 || !t.active) return false
        const D = Math.max(1, differenceInCalendarDays(parseISO(t.nextClassDate), today))
        return D <= 1 && R > 0
      })
      if (!emergency) return buildChoice(current, slotMinutes, {}, settings)
    }
  }

  // step0 candidates
  const candidates = tracks.filter((t) => t.active && t.totalActs - t.doneActs > 0)
  if (!candidates.length) return null

  // compute metrics
  const metrics = new Map<string, Metrics>()
  for (const t of candidates) {
    const R = t.totalActs - t.doneActs
    const D = Math.max(1, differenceInCalendarDays(parseISO(t.nextClassDate), today))
    const Q = Math.ceil(R / D)
    const H = actsToday.get(t.slug) || 0
    const delta = Q - H
    const lastGap = t.lastTouched
      ? differenceInCalendarDays(today, parseISO(t.lastTouched))
      : 999
    const minutesBase = minutesByBase.get(t.base) || 0
    let pressure = R / D
    if (D <= 1) pressure += 100
    else if (D <= 3) pressure += 10
    pressure += Math.min(lastGap, 7) * 0.1
    metrics.set(t.slug, { R, D, Q, H, delta, lastGap, minutesBase, pressure })
  }

  // step1 coverage
  const bases = ['algebra', 'calculo', 'poo']
  const lackingBases = bases.filter(
    (b) => (minutesByBase.get(b) || 0) < settings.B
  )
  let order: Track[] = []
  if (lackingBases.length > 0) {
    order = candidates
      .filter((t) => lackingBases.includes(t.base))
      .sort((a, b) => {
        const ma = metrics.get(a.slug)!
        const mb = metrics.get(b.slug)!
        if (mb.delta !== ma.delta) return mb.delta - ma.delta
        if (ma.D !== mb.D) return ma.D - mb.D
        return mb.lastGap - ma.lastGap
      })
  } else {
    order = [...candidates].sort((a, b) => {
      const ma = metrics.get(a.slug)!
      const mb = metrics.get(b.slug)!
      if (mb.delta !== ma.delta) return mb.delta - ma.delta
      if (ma.D !== mb.D) return ma.D - mb.D
      return mb.lastGap - ma.lastGap
    })
    if (metrics.get(order[0].slug)!.delta <= 0) {
      // all deltas <=0, use pressure
      order = [...candidates].sort((a, b) => {
        const ma = metrics.get(a.slug)!
        const mb = metrics.get(b.slug)!
        if (mb.pressure !== ma.pressure) return mb.pressure - ma.pressure
        return ma.D - mb.D
      })
    }
    // practice window
    const practiceCandidates = order.filter((t) => {
      const m = metrics.get(t.slug)!
      return (
        t.type === 'P' &&
        m.D * 24 <= settings.practiceWindowHours
      )
    })
    if (practiceCandidates.length > 0) {
      practiceCandidates.sort(
        (a, b) => metrics.get(a.slug)!.D - metrics.get(b.slug)!.D
      )
      const bestP = practiceCandidates[0]
      order = [bestP, ...order.filter((t) => t.slug !== bestP.slug)]
    }
  }

  // apply Cmax
  const pick = order.find((t) => {
    const m = metrics.get(t.slug)!
    const baseRatio = totalMinutes === 0 ? 0 : m.minutesBase / totalMinutes
    if (baseRatio > settings.Cmax && !(m.D <= 1 && m.R > 0)) {
      return false
    }
    return true
  })
  if (!pick) return null

  const m = metrics.get(pick.slug)!
  const coverageNote = lackingBases.includes(pick.base)
  const practiceNote = pick.type === 'P' && m.D * 24 <= settings.practiceWindowHours
  return buildChoice(
    pick,
    slotMinutes,
    { metrics: m, coverage: coverageNote, practice: practiceNote },
    settings
  )
}

function buildChoice(
  track: Track,
  slotMinutes: number,
  info: { metrics?: Metrics; coverage?: boolean; practice?: boolean },
  settings: Settings
): Choice {
  const metrics = info.metrics || {
    R: track.totalActs - track.doneActs,
    D: 1,
    Q: 0,
    H: 0,
    delta: 0,
    lastGap: 0,
    minutesBase: 0,
    pressure: 0,
  }
  const acts = Math.max(1, Math.floor(slotMinutes / track.avgMinPerAct))
  const mins = acts * track.avgMinPerAct
  const reasonParts = [
    `${track.base} ${track.type}`,
    metrics.delta > 0 ? `déficit ${metrics.delta}` : 'sin déficit',
    `clase en ${metrics.D} días`,
  ]
  if (info.coverage) reasonParts.push(`+ cobertura ${track.base}`)
  if (info.practice) reasonParts.push('+ práctica ≤48 h')
  return {
    trackSlug: track.slug,
    nextIndex: track.nextIndex,
    plannedActs: acts,
    plannedMinutes: mins,
    reason: reasonParts.join(', '),
    diagnostics: {
      deficit: metrics.delta,
      daysRemaining: metrics.D,
      remaining: metrics.R,
      quota: metrics.Q,
      score: metrics.pressure,
    },
  }
}

