import fs from "fs"
import path from "path"
import { differenceInCalendarDays } from "date-fns"

export interface Event {
  id: string
  date: string
  name: string
  importance: number
  content: string
  completed: number
  total: number
  daysRemaining: number
  isEditing: boolean
}

const DATA_DIR = process.env.EVENTS_DIR
  ? path.resolve(process.env.EVENTS_DIR)
  : path.join(process.cwd(), "data")
const FILE = path.join(DATA_DIR, "events.json")

const defaultEvents: Event[] = [
  {
    id: "1",
    date: "2025-08-26",
    name: "1° seg",
    importance: 2,
    content: "Sem 1 a 2",
    completed: 0,
    total: 0,
    daysRemaining: 5,
    isEditing: false,
  },
  {
    id: "2",
    date: "2025-08-31",
    name: "1° seg",
    importance: 2,
    content: "Base Cabio base",
    completed: 0,
    total: 0,
    daysRemaining: 10,
    isEditing: false,
  },
  {
    id: "3",
    date: "2025-09-21",
    name: "1° Parcial",
    importance: 2,
    content: "U1 A U4",
    completed: 0,
    total: 0,
    daysRemaining: 31,
    isEditing: false,
  },
]

function updateDays(events: Event[]): Event[] {
  const today = new Date()
  return events.map((e) => ({
    ...e,
    daysRemaining: differenceInCalendarDays(new Date(e.date), today),
  }))
}

export function loadEvents(): Event[] {
  try {
    if (!fs.existsSync(FILE)) {
      fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 })
      fs.writeFileSync(FILE, JSON.stringify(defaultEvents, null, 2), {
        mode: 0o600,
      })
      return updateDays(defaultEvents)
    }
    const raw = fs.readFileSync(FILE, "utf8")
    const events: Event[] = JSON.parse(raw)
    return updateDays(events)
  } catch {
    return updateDays(defaultEvents)
  }
}

export function saveEvents(events: Event[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 })
  fs.writeFileSync(FILE, JSON.stringify(updateDays(events), null, 2), {
    mode: 0o600,
  })
}
