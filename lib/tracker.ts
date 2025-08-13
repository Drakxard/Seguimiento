import { promises as fs } from 'fs'
import { join } from 'path'

export interface Track {
  slug: string
  base: 'Algebra' | 'Calculo' | 'Poo'
  type: 'T' | 'P'
  totalActs: number
  doneActs: number
  nextClass: string // ISO date
  nextIndex: number
  lastTouched: string | null
  avgMinPerAct: number
  active: boolean
}

export interface ProgressLog {
  date: string // YYYY-MM-DD
  trackSlug: string
  minutes: number
}

export interface Selection {
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

const DATA_DIR = join(process.cwd(), 'data')
const TRACKS_PATH = join(DATA_DIR, 'tracks.json')
const LOGS_PATH = join(DATA_DIR, 'logs.json')

async function readJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const data = await fs.readFile(path, 'utf8')
    return JSON.parse(data)
  } catch {
    return fallback
  }
}

export async function loadTracks(): Promise<Track[]> {
  return readJSON<Track[]>(TRACKS_PATH, [])
}

export async function saveTracks(tracks: Track[]): Promise<void> {
  await fs.writeFile(TRACKS_PATH, JSON.stringify(tracks, null, 2))
}

export async function loadLogs(): Promise<ProgressLog[]> {
  return readJSON<ProgressLog[]>(LOGS_PATH, [])
}

export async function saveLogs(logs: ProgressLog[]): Promise<void> {
  await fs.writeFile(LOGS_PATH, JSON.stringify(logs, null, 2))
}

const DAILY_COVERAGE = 50
const CMAX = 0.6
const PRACTICE_WINDOW = 2 // days

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysUntil(dateStr: string): number {
  const today = new Date(todayStr())
  const target = new Date(dateStr)
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000)
  return diff < 1 ? 1 : diff
}

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 999
  const today = new Date(todayStr())
  const d = new Date(dateStr)
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000)
  return diff < 0 ? 0 : diff
}

interface TrackStats {
  track: Track
  remaining: number
  daysRemaining: number
  quota: number
  doneToday: number
  deficit: number
  pressure: number
  lastGap: number
  baseMinutes: number
  baseShare: number
}

function computeStats(tracks: Track[], logs: ProgressLog[]): TrackStats[] {
  const today = todayStr()
  const logsToday = logs.filter((l) => l.date === today)
  const actsToday: Record<string, number> = {}
  const minutesByBase: Record<string, number> = {}
  for (const log of logsToday) {
    actsToday[log.trackSlug] = (actsToday[log.trackSlug] || 0) + 1
  }
  for (const log of logsToday) {
    const track = tracks.find((t) => t.slug === log.trackSlug)
    if (track) {
      minutesByBase[track.base] = (minutesByBase[track.base] || 0) + log.minutes
    }
  }
  const totalMinutesToday = Object.values(minutesByBase).reduce((a, b) => a + b, 0)

  return tracks.map((t) => {
    const remaining = t.totalActs - t.doneActs
    const daysRemaining = daysUntil(t.nextClass)
    const quota = Math.ceil(remaining / daysRemaining)
    const doneToday = actsToday[t.slug] || 0
    const deficit = quota - doneToday
    let pressure = remaining / daysRemaining
    if (daysRemaining <= 1) pressure += 2
    else if (daysRemaining <= 3) pressure += 1
    pressure += Math.min(daysSince(t.lastTouched), 7) / 7
    const baseMinutes = minutesByBase[t.base] || 0
    const baseShare = totalMinutesToday ? baseMinutes / totalMinutesToday : 0
    return {
      track: t,
      remaining,
      daysRemaining,
      quota,
      doneToday,
      deficit,
      pressure,
      lastGap: daysSince(t.lastTouched),
      baseMinutes,
      baseShare,
    }
  })
}

function chooseFromStats(stats: TrackStats[], comparator: (a: TrackStats, b: TrackStats) => number): TrackStats {
  const sorted = [...stats].sort((a, b) => {
    const cmp = comparator(b, a)
    if (cmp !== 0) return cmp
    if (a.daysRemaining !== b.daysRemaining) return a.daysRemaining - b.daysRemaining
    return b.lastGap - a.lastGap
  })
  return sorted[0]
}

export function applyProgress(track: Track, minutesSpent?: number): Track {
  const minutes = minutesSpent ?? track.avgMinPerAct
  return {
    ...track,
    doneActs: track.doneActs + 1,
    nextIndex: track.nextIndex + 1,
    lastTouched: new Date().toISOString(),
    avgMinPerAct: track.avgMinPerAct
      ? track.avgMinPerAct * 0.7 + minutes * 0.3
      : minutes,
  }
}

interface NextOptions {
  slotMinutes: number
  currentTrackSlug?: string
  forceSwitch?: boolean
}

export function selectNext(
  tracks: Track[],
  logs: ProgressLog[],
  opts: NextOptions
): Selection | null {
  let candidates = tracks.filter((t) => t.active && t.totalActs > t.doneActs)
  if (candidates.length === 0) return null

  const stats = computeStats(candidates, logs)

  // Block commitment
  if (opts.currentTrackSlug && !opts.forceSwitch) {
    const current = stats.find((s) => s.track.slug === opts.currentTrackSlug)
    const emergency = stats.some(
      (s) => s.track.slug !== opts.currentTrackSlug && s.daysRemaining <= 1 && s.remaining > 0
    )
    if (current && !emergency) {
      return buildSelection(current, opts.slotMinutes, [], false)
    }
  }

  const coverageBases = new Set<string>()
  const minutesByBase: Record<string, number> = {}
  for (const s of stats) {
    minutesByBase[s.track.base] = s.baseMinutes
    if (s.baseMinutes < DAILY_COVERAGE) coverageBases.add(s.track.base)
  }

  // Step 1: coverage
  if (coverageBases.size > 0) {
    const coverageStats = stats.filter((s) => coverageBases.has(s.track.base))
    const chosen = chooseFromStats(coverageStats, (a, b) => a.deficit - b.deficit)
    return buildSelection(chosen, opts.slotMinutes, coverageBases, false)
  }

  // Step 2: deficit
  const maxDeficit = Math.max(...stats.map((s) => s.deficit))
  let ordered: TrackStats[]
  if (maxDeficit > 0) {
    ordered = [...stats].sort((a, b) => {
      if (a.deficit !== b.deficit) return b.deficit - a.deficit
      if (a.daysRemaining !== b.daysRemaining) return a.daysRemaining - b.daysRemaining
      return b.lastGap - a.lastGap
    })
  } else {
    ordered = [...stats].sort((a, b) => {
      if (a.pressure !== b.pressure) return b.pressure - a.pressure
      if (a.daysRemaining !== b.daysRemaining) return a.daysRemaining - b.daysRemaining
      return b.lastGap - a.lastGap
    })
  }

  const practiceCandidates = ordered.filter(
    (s) => s.track.type === 'P' && s.daysRemaining <= PRACTICE_WINDOW
  )

  function passesCmax(s: TrackStats) {
    return s.baseShare <= CMAX || s.daysRemaining <= 1
  }

  let chosen = ordered.find((s) => passesCmax(s)) || ordered[0]

  if (practiceCandidates.length > 0) {
    const candidate = practiceCandidates.find((s) => passesCmax(s))
    if (candidate) chosen = candidate
  }

  return buildSelection(chosen, opts.slotMinutes, coverageBases, practiceCandidates.includes(chosen))
}

function buildSelection(
  stat: TrackStats,
  slotMinutes: number,
  coverageBases: Set<string>,
  practiceWindow: boolean
): Selection {
  const t = stat.track
  const acts = Math.max(1, Math.floor(slotMinutes / (t.avgMinPerAct || 1)))
  const plannedMinutes = acts * (t.avgMinPerAct || 1)
  let reason = `${t.base} ${t.type} — `
  reason += stat.deficit > 0 ? `déficit ${stat.deficit}` : `sin déficit`
  reason += `, clase en ${stat.daysRemaining} días`
  if (coverageBases.has(t.base)) reason += ` + cobertura ${t.base}`
  if (practiceWindow) reason += ` + práctica ≤48 h`

  return {
    trackSlug: t.slug,
    nextIndex: t.nextIndex,
    plannedActs: acts,
    plannedMinutes,
    reason,
    diagnostics: {
      deficit: stat.deficit,
      daysRemaining: stat.daysRemaining,
      remaining: stat.remaining,
      quota: stat.quota,
      score: Math.max(stat.deficit, stat.pressure),
    },
  }
}

export function recordProgress(
  tracks: Track[],
  logs: ProgressLog[],
  trackSlug: string,
  minutesSpent?: number
): { tracks: Track[]; logs: ProgressLog[]; updated: Track } {
  const idx = tracks.findIndex((t) => t.slug === trackSlug)
  if (idx === -1) throw new Error('not found')
  const track = tracks[idx]
  if (track.doneActs >= track.totalActs) throw new Error('complete')
  const updated = applyProgress(track, minutesSpent)
  const today = todayStr()
  const log: ProgressLog = {
    date: today,
    trackSlug,
    minutes: minutesSpent ?? updated.avgMinPerAct,
  }
  const newTracks = [...tracks]
  newTracks[idx] = updated
  const newLogs = [...logs, log]
  return { tracks: newTracks, logs: newLogs, updated }
}
