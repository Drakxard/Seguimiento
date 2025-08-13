import { promises as fs } from 'fs'
import path from 'path'

export interface Track {
  slug: string
  base: 'algebra' | 'calculo' | 'poo'
  type: 'T' | 'P'
  totalActs: number
  doneActs: number
  nextClassDate: string
  nextIndex: number
  lastTouched: string | null
  avgMinPerAct: number
  active: boolean
}

export interface LogEntry {
  date: string
  trackSlug: string
  minutes: number
}

const dataDir = path.join(process.cwd(), 'data')
const tracksFile = path.join(dataDir, 'tracks.json')
const logsDir = path.join(dataDir, 'logs')

async function ensureDirs() {
  await fs.mkdir(logsDir, { recursive: true })
}

export async function loadTracks(): Promise<Track[]> {
  await ensureDirs()
  try {
    const txt = await fs.readFile(tracksFile, 'utf8')
    return JSON.parse(txt) as Track[]
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }
}

export async function saveTracks(tracks: Track[]) {
  await ensureDirs()
  await fs.writeFile(tracksFile, JSON.stringify(tracks, null, 2))
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function logPath(date = todayDate()) {
  return path.join(logsDir, `${date}.json`)
}

export async function loadTodayLog(date = todayDate()): Promise<LogEntry[]> {
  await ensureDirs()
  try {
    const txt = await fs.readFile(logPath(date), 'utf8')
    return JSON.parse(txt) as LogEntry[]
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }
}

export async function appendLog(entry: LogEntry) {
  const date = entry.date.slice(0,10)
  const file = logPath(date)
  const entries = await loadTodayLog(date)
  entries.push(entry)
  await fs.writeFile(file, JSON.stringify(entries, null, 2))
}

