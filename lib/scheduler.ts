import { differenceInCalendarDays } from "date-fns"
import { daily, tracks, Track, Subject } from "./tracks"

const B = 50 // minimum coverage per subject
const CMAX = 0.6 // maximum share per subject

function todayString() {
  return new Date().toISOString().split("T")[0]
}

function resetDailyIfNeeded() {
  const today = todayString()
  if (daily.date !== today) {
    daily.date = today
    daily.minutes.algebra = 0
    daily.minutes.calculo = 0
    daily.minutes.poo = 0
    tracks.forEach((t) => (t.doneActsToday = 0))
  }
}

function computeDeficit(track: Track) {
  const cuota = Math.ceil(track.R / track.D)
  const delta = cuota - track.doneActsToday
  return { cuota, delta }
}

function chooseByDeficit(candidates: Track[]) {
  let chosen = candidates[0]
  let info = computeDeficit(chosen)
  for (const t of candidates.slice(1)) {
    const i = computeDeficit(t)
    if (
      i.delta > info.delta ||
      (i.delta === info.delta && (t.D < chosen.D || (t.D === chosen.D && t.lastTouched < chosen.lastTouched)))
    ) {
      chosen = t
      info = i
    }
  }
  return { track: chosen, ...info }
}

function pressureScore(track: Track) {
  let score = track.R / track.D
  if (track.D <= 1) score += 10
  else if (track.D <= 3) score += 5
  const daysSince = differenceInCalendarDays(new Date(), new Date(track.lastTouched))
  score += daysSince * 0.1
  return score
}

function chooseByPressure(candidates: Track[]) {
  let chosen = candidates[0]
  let best = pressureScore(chosen)
  for (const t of candidates.slice(1)) {
    const score = pressureScore(t)
    if (score > best) {
      best = score
      chosen = t
    }
  }
  const { cuota } = computeDeficit(chosen)
  return { track: chosen, delta: 0, cuota }
}

function buildPlan(track: Track, slotMinutes: number, reason: string) {
  const plannedActs = Math.max(1, Math.floor(slotMinutes / track.avgMinPerAct))
  const plannedMinutes = plannedActs * track.avgMinPerAct
  const { delta, cuota } = computeDeficit(track)
  return {
    trackSlug: track.slug,
    nextIndex: track.nextIndex,
    plannedActs,
    plannedMinutes,
    reason,
    diagnostics: {
      delta,
      D: track.D,
      R: track.R,
      cuota,
      score: track.R / track.D,
    },
  }
}

export function selectNextTrack({
  slotMinutes,
  currentTrackSlug,
  forceSwitch,
}: {
  slotMinutes: number
  currentTrackSlug?: string
  forceSwitch?: boolean
}) {
  resetDailyIfNeeded()
  const candidates = tracks.filter((t) => t.active && t.R > 0)
  if (candidates.length === 0) return null

  if (currentTrackSlug && !forceSwitch) {
    const current = tracks.find((t) => t.slug === currentTrackSlug)
    if (current) return buildPlan(current, slotMinutes, "continuar bloque")
  }

  // coverage check
  const subjects: Subject[] = ["algebra", "calculo", "poo"]
  for (const s of subjects) {
    if (daily.minutes[s] < B) {
      const subjectTracks = candidates.filter((t) => t.subject === s)
      if (subjectTracks.length) {
        const { track } = chooseByDeficit(subjectTracks)
        return buildPlan(track, slotMinutes, `cobertura ${s}`)
      }
    }
  }

  let { track, delta, cuota } = chooseByDeficit(candidates)
  if (delta <= 0) {
    const res = chooseByPressure(candidates)
    track = res.track
    cuota = res.cuota
  }

  const totalMinutes =
    daily.minutes.algebra + daily.minutes.calculo + daily.minutes.poo
  if (totalMinutes > 0) {
    const share = daily.minutes[track.subject] / totalMinutes
    if (share > CMAX && track.D > 1) {
      const filtered = candidates.filter((t) => t.subject !== track.subject)
      if (filtered.length) {
        const alt = chooseByDeficit(filtered)
        return buildPlan(alt.track, slotMinutes, "equilibrio")
      }
    }
  }

  return buildPlan(track, slotMinutes, delta > 0 ? "déficit" : "presión")
}

export function recordProgress({
  trackSlug,
  minutesSpent,
}: {
  trackSlug: string
  minutesSpent?: number
}) {
  resetDailyIfNeeded()
  const track = tracks.find((t) => t.slug === trackSlug)
  if (!track) throw new Error("track not found")
  track.doneActsToday += 1
  track.nextIndex += 1
  track.R = Math.max(0, track.R - 1)
  track.lastTouched = new Date().toISOString()
  if (minutesSpent) {
    track.avgMinPerAct = track.avgMinPerAct * 0.7 + minutesSpent * 0.3
    daily.minutes[track.subject] += minutesSpent
  }
  return { updatedTrack: track, suggestedNext: null }
}
