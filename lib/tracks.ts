// @ts-nocheck
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const TRACKS_FILE = path.join(DATA_DIR, 'tracks.json')
const LOGS_FILE = path.join(DATA_DIR, 'logs.json')

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    return []
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export function loadTracks() {
  return readJson(TRACKS_FILE)
}

export function saveTracks(tracks) {
  writeJson(TRACKS_FILE, tracks)
}

export function loadLogs() {
  return readJson(LOGS_FILE)
}

export function appendLog(entry) {
  const logs = loadLogs()
  logs.push(entry)
  writeJson(LOGS_FILE, logs)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(dateStr) {
  const now = new Date(today())
  const target = new Date(dateStr)
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff < 1 ? 1 : diff
}

function actsDoneToday(logs, slug) {
  const t = today()
  return logs.filter(l => l.trackSlug === slug && l.date === t).length
}

function minutesBySubjectToday(logs, tracks) {
  const t = today()
  const mins = { algebra: 0, calculo: 0, poo: 0 }
  logs.forEach(l => {
    if (l.date === t) {
      const track = tracks.find(tr => tr.slug === l.trackSlug)
      if (track) mins[track.subject] += l.minutes || 0
    }
  })
  return mins
}

function totalMinutesToday(logs) {
  const t = today()
  return logs.filter(l => l.date === t).reduce((a,b) => a + (b.minutes||0), 0)
}

function daysSinceLastTouched(track) {
  if (!track.lastTouched) return 999
  return daysBetween(track.lastTouched)
}

const B = 50
const CMAX = 0.6

export function recordProgress({ trackSlug, minutesSpent = 0 }) {
  const tracks = loadTracks()
  const track = tracks.find(t => t.slug === trackSlug)
  if (!track) throw new Error('Track not found')
  if (track.doneActs >= track.totalActs) throw new Error('Track complete')

  track.doneActs += 1
  track.nextIndex += 1
  track.lastTouched = today()
  track.avgMinPerAct = track.avgMinPerAct
    ? track.avgMinPerAct * 0.7 + minutesSpent * 0.3
    : minutesSpent || track.avgMinPerAct

  saveTracks(tracks)
  appendLog({ trackSlug, minutes: minutesSpent, date: today() })
  return track
}

export function selectNext({ slotMinutes = 60, currentTrackSlug, forceSwitch = false }) {
  const tracks = loadTracks()
  const logs = loadLogs()

  const candidates = tracks.filter(t => t.active && t.totalActs > t.doneActs)
  if (!candidates.length) return null

  const mins = minutesBySubjectToday(logs, tracks)
  const totalMins = totalMinutesToday(logs)

  const stats = candidates.map(t => {
    const R = t.totalActs - t.doneActs
    const D = daysBetween(t.nextClassDate)
    const H = actsDoneToday(logs, t.slug)
    const Q = Math.ceil(R / D)
    const delta = Q - H
    const pressure = R / D
    return { track: t, R, D, H, Q, delta, pressure }
  })

  // Step 0 already done

  // Step 1: coverage
  const needCoverage = Object.entries(mins).filter(([sub, val]) => val < B).map(([s]) => s)
  let pool = stats
  let reason = ''
  if (needCoverage.length) {
    pool = stats.filter(s => needCoverage.includes(s.track.subject))
    pool.sort((a,b) => {
      if (b.delta !== a.delta) return b.delta - a.delta
      if (a.D !== b.D) return a.D - b.D
      return daysSinceLastTouched(b.track) - daysSinceLastTouched(a.track)
    })
    const chosen = pool[0]
    if (!chosen) return null
    const plannedActs = Math.max(1, Math.floor(slotMinutes / chosen.track.avgMinPerAct))
    const plannedMinutes = plannedActs * chosen.track.avgMinPerAct
    reason = `cobertura ${chosen.track.subject}`
    return {
      trackSlug: chosen.track.slug,
      nextIndex: chosen.track.nextIndex,
      plannedActs,
      plannedMinutes,
      reason,
      diagnostics: {
        deficit: chosen.delta,
        daysRemaining: chosen.D,
        remaining: chosen.R,
        quota: chosen.Q,
        score: chosen.delta
      }
    }
  }

  // Step 2: deficit rule
  pool = stats.slice().sort((a,b) => b.delta - a.delta)
  if (pool[0].delta <= 0) {
    // Use pressure + bonuses
    pool = stats.map(s => {
      let score = s.pressure
      if (s.D <= 1) score += 2
      else if (s.D <= 3) score += 1
      const cool = Math.min(daysSinceLastTouched(s.track), 7) * 0.1
      score += cool
      if (s.track.type === 'P' && s.D <= 2) score += 0.5
      return { ...s, score }
    }).sort((a,b) => b.score - a.score)
    reason = pool[0].D <=1 ? 'evento ≤24h' : 'presión'
  } else {
    pool = pool.filter(p => p.delta === pool[0].delta)
    pool.sort((a,b) => {
      if (a.D !== b.D) return a.D - b.D
      return daysSinceLastTouched(b.track) - daysSinceLastTouched(a.track)
    })
    reason = `déficit ${pool[0].delta}`
  }

  // Step 3: Cmax
  let chosen = pool[0]
  for (const p of pool) {
    const subjectMin = mins[p.track.subject] || 0
    if (totalMins === 0) { chosen = p; break }
    const ratio = subjectMin / totalMins
    if (ratio <= CMAX || p.D <= 1) { chosen = p; break }
  }

  if (currentTrackSlug && !forceSwitch) {
    const keep = stats.find(s => s.track.slug === currentTrackSlug && s.R > 0)
    const emergency = stats.some(s => s.track.slug !== currentTrackSlug && s.D <=1 && s.R>0)
    if (keep && !emergency) {
      chosen = keep
      reason = 'mismo bloque'
    }
  }

  const plannedActs = Math.max(1, Math.floor(slotMinutes / chosen.track.avgMinPerAct))
  const plannedMinutes = plannedActs * chosen.track.avgMinPerAct
  return {
    trackSlug: chosen.track.slug,
    nextIndex: chosen.track.nextIndex,
    plannedActs,
    plannedMinutes,
    reason,
    diagnostics: {
      deficit: chosen.delta,
      daysRemaining: chosen.D,
      remaining: chosen.R,
      quota: chosen.Q,
      score: chosen.delta
    }
  }
}
