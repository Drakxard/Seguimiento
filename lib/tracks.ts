import { differenceInCalendarDays } from "date-fns"
import { events } from "./events"

export type Subject = "algebra" | "calculo" | "poo"

export interface Track {
  slug: string
  subject: Subject
  R: number
  D: number
  lastTouched: string
  avgMinPerAct: number
  active: boolean
  doneActsToday: number
  nextIndex: number
}

// Initialize tracks from existing events data
const today = new Date()

function resolveSubject(name: string): Subject {
  const lower = name.toLowerCase()
  if (lower.includes("álgebra")) return "algebra"
  if (lower.includes("cálculo")) return "calculo"
  return "poo"
}

export const tracks: Track[] = events.map((e) => {
  const subject = resolveSubject(e.name)
  const D = Math.max(
    1,
    differenceInCalendarDays(new Date(e.date), today),
  )
  return {
    slug: e.id,
    subject,
    R: Math.max(0, e.total - e.completed),
    D,
    lastTouched: today.toISOString(),
    avgMinPerAct: 50,
    active: true,
    doneActsToday: 0,
    nextIndex: e.completed,
  }
})

// Daily minutes per subject
export interface DailyState {
  date: string
  minutes: Record<Subject, number>
}

export const daily: DailyState = {
  date: today.toISOString().split("T")[0],
  minutes: {
    algebra: 0,
    calculo: 0,
    poo: 0,
  },
}
