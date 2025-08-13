import fs from 'fs/promises'
import path from 'path'
import {
  differenceInCalendarDays,
  isSameDay,
} from 'date-fns'

export type Subject = 'algebra' | 'calculo' | 'programacion'
export type TrackType = 'T' | 'P'

export interface Track {
  trackSlug: string
  subject: Subject
  type: TrackType
  totalActs: number
  doneActs: number
  nextClassDate: string
  nextIndex: number
  lastTouched: string
  avgMinPerAct: number
  active: boolean
}

export interface LogEntry {
  trackSlug: string
  date: string
  minutes: number
}

export interface Suggestion {
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

interface TrackInfo {
  track: Track
  remaining: number
  daysUntilClass: number
  actsToday: number
  quota: number
  deficit: number
  pressure: number
  cooling: number
}

const DATA_DIR = path.join(process.cwd(), 'data')
const TRACKS_FILE = path.join(DATA_DIR, 'tracks.json')
const LOGS_FILE = path.join(DATA_DIR, 'logs.json')

const B = 50
const CMAX = 0.6

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

export async function loadTracks(): Promise<Track[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(TRACKS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (e: any) {
    if (e.code === 'ENOENT') return []
    throw e
  }
}

export async function saveTracks(tracks: Track[]) {
  await ensureDataDir()
  await fs.writeFile(TRACKS_FILE, JSON.stringify(tracks, null, 2))
}

export async function loadLogs(): Promise<LogEntry[]> {
  try {
    await ensureDataDir()
    const data = await fs.readFile(LOGS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (e: any) {
    if (e.code === 'ENOENT') return []
    throw e
  }
}

export async function saveLogs(logs: LogEntry[]) {
  await ensureDataDir()
  await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2))
}

function buildTrackInfos(tracks: Track[], logs: LogEntry[]): TrackInfo[] {
  const today = new Date()
  return tracks.map((t) => {
    const remaining = t.totalActs - t.doneActs
    const daysUntilClass = Math.max(
      1,
      differenceInCalendarDays(new Date(t.nextClassDate), today)
    )
    const actsToday = logs.filter(
      (l) => l.trackSlug === t.trackSlug && isSameDay(new Date(l.date), today)
    ).length
    const quota = Math.ceil(remaining / daysUntilClass)
    const deficit = quota - actsToday
    let pressure = remaining / daysUntilClass
    if (daysUntilClass <= 1) pressure += 100
    else if (daysUntilClass <= 3) pressure += 10
    const cooling = Math.min(
      7,
      differenceInCalendarDays(
        today,
        t.lastTouched ? new Date(t.lastTouched) : new Date(0)
      )
    )
    pressure += cooling * 0.1
    return {
      track: t,
      remaining,
      daysUntilClass,
      actsToday,
      quota,
      deficit,
      pressure,
      cooling,
    }
  })
}

function computeMinutesBySubject(
  logs: LogEntry[],
  tracks: Track[]
): Record<Subject, number> {
  const today = new Date()
  const map = new Map<string, Subject>()
  tracks.forEach((t) => map.set(t.trackSlug, t.subject))
  const result: Record<Subject, number> = {
    algebra: 0,
    calculo: 0,
    programacion: 0,
  }
  logs.forEach((l) => {
    if (isSameDay(new Date(l.date), today)) {
      const subj = map.get(l.trackSlug)
      if (subj) result[subj] += l.minutes || 0
    }
  })
  return result
}

function compareDeficit(a: TrackInfo, b: TrackInfo): number {
  if (b.deficit !== a.deficit) return b.deficit - a.deficit
  if (a.daysUntilClass !== b.daysUntilClass)
    return a.daysUntilClass - b.daysUntilClass
  return b.cooling - a.cooling
}

function compareScore(a: TrackInfo, b: TrackInfo): number {
  const scoreA = a.deficit > 0 ? a.deficit : a.pressure
  const scoreB = b.deficit > 0 ? b.deficit : b.pressure
  if (scoreB !== scoreA) return scoreB - scoreA
  if (a.daysUntilClass !== b.daysUntilClass)
    return a.daysUntilClass - b.daysUntilClass
  return b.cooling - a.cooling
}

function buildSuggestion(
  info: TrackInfo,
  slotMinutes: number,
  minutesBySubject: Record<Subject, number>,
  totalMinutes: number,
  allCovered: boolean
): Suggestion {
  const avg = info.track.avgMinPerAct || 1
  const plannedActs = Math.max(1, Math.floor(slotMinutes / avg))
  const plannedMinutes = plannedActs * avg
  const subjectNames: Record<Subject, string> = {
    algebra: 'Álgebra',
    calculo: 'Cálculo',
    programacion: 'Programación',
  }
  const reasonParts = [
    `${subjectNames[info.track.subject]} ${info.track.type}`,
    info.deficit > 0 ? `déficit ${info.deficit}` : 'sin déficit',
    `clase en ${info.daysUntilClass} días`,
  ]
  if (minutesBySubject[info.track.subject] < B)
    reasonParts.push(`+ cobertura ${info.track.subject}`)
  if (allCovered && info.track.type === 'P' && info.daysUntilClass <= 2)
    reasonParts.push('+ práctica ≤48 h')
  const score = info.deficit > 0 ? info.deficit : info.pressure
  return {
    trackSlug: info.track.trackSlug,
    nextIndex: info.track.nextIndex,
    plannedActs,
    plannedMinutes,
    reason: reasonParts.join(', '),
    diagnostics: {
      deficit: info.deficit,
      daysRemaining: info.daysUntilClass,
      remaining: info.remaining,
      quota: info.quota,
      score,
    },
  }
}

export function suggestNext(
  tracks: Track[],
  logs: LogEntry[],
  slotMinutes: number,
  currentTrackSlug?: string,
  forceSwitch?: boolean
): Suggestion | null {
  const infos = buildTrackInfos(tracks, logs)

  if (currentTrackSlug && !forceSwitch) {
    const current = infos.find((i) => i.track.trackSlug === currentTrackSlug)
    const emergency = infos.some(
      (i) => i.track.trackSlug !== currentTrackSlug && i.daysUntilClass <= 1 && i.remaining > 0
    )
    if (current && current.remaining > 0 && !emergency) {
      const minutesBySubject = computeMinutesBySubject(logs, tracks)
      const totalMinutes = Object.values(minutesBySubject).reduce((a, b) => a + b, 0)
      const allCovered = Object.values(minutesBySubject).every((m) => m >= B)
      return buildSuggestion(
        current,
        slotMinutes,
        minutesBySubject,
        totalMinutes,
        allCovered
      )
    }
  }

  let candidates = infos.filter((i) => i.track.active && i.remaining > 0)
  if (candidates.length === 0) return null

  const minutesBySubject = computeMinutesBySubject(logs, tracks)
  const totalMinutes = Object.values(minutesBySubject).reduce((a, b) => a + b, 0)
  const subjectsNeedingCoverage = Object.entries(minutesBySubject)
    .filter(([, m]) => m < B)
    .map(([s]) => s as Subject)
  const allCovered = subjectsNeedingCoverage.length === 0

  if (subjectsNeedingCoverage.length > 0) {
    const subject = subjectsNeedingCoverage[0]
    const subset = candidates.filter((i) => i.track.subject === subject)
    if (subset.length > 0) {
      subset.sort(compareDeficit)
      return buildSuggestion(
        subset[0],
        slotMinutes,
        minutesBySubject,
        totalMinutes,
        allCovered
      )
    }
  }

  const ranked = candidates.slice().sort(compareScore)
  let candidate: TrackInfo | undefined
  for (const info of ranked) {
    const subjMinutes = minutesBySubject[info.track.subject] || 0
    const ratio = totalMinutes > 0 ? subjMinutes / totalMinutes : 0
    if (ratio > CMAX && !(info.daysUntilClass <= 1 && info.remaining > 0)) {
      continue
    }
    candidate = info
    break
  }
  if (!candidate) candidate = ranked[0]

  if (allCovered) {
    const practice = ranked.find(
      (i) => i.track.type === 'P' && i.daysUntilClass <= 2
    )
    if (practice) candidate = practice
  }

  return buildSuggestion(
    candidate,
    slotMinutes,
    minutesBySubject,
    totalMinutes,
    allCovered
  )
}

export async function recordProgress(
  trackSlug: string,
  minutesSpent?: number,
  nextIndex?: number
): Promise<{ track: Track; tracks: Track[]; logs: LogEntry[] }> {
  const tracks = await loadTracks()
  const logs = await loadLogs()
  const track = tracks.find((t) => t.trackSlug === trackSlug)
  if (!track) throw new Error('track not found')
  const remaining = track.totalActs - track.doneActs
  if (remaining <= 0) throw new Error('track complete')
  track.doneActs += 1
  track.nextIndex = typeof nextIndex === 'number' ? nextIndex : track.nextIndex + 1
  const now = new Date()
  track.lastTouched = now.toISOString()
  if (typeof minutesSpent === 'number') {
    track.avgMinPerAct = track.avgMinPerAct
      ? track.avgMinPerAct * 0.7 + minutesSpent * 0.3
      : minutesSpent
  }
  await saveTracks(tracks)
  logs.push({ trackSlug, date: now.toISOString(), minutes: minutesSpent || 0 })
  await saveLogs(logs)
  return { track, tracks, logs }
}
