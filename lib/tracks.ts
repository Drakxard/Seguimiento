import fs from "fs"
import path from "path"

export type Subject = "Álgebra" | "Cálculo" | "POO"

export interface Track {
  slug: string
  subject: Subject
  R: number // remaining acts
  classDate: string // ISO date string
  nextIndex: number
  lastTouched: number // timestamp ms
  avgMinPerAct: number
  active: boolean
  doneActs: number
}

const tracksFile = path.join(process.cwd(), "data", "tracks.json")

export const tracks: Track[] = JSON.parse(
  fs.readFileSync(tracksFile, "utf-8")
)

export function saveTracks() {
  fs.writeFileSync(tracksFile, JSON.stringify(tracks, null, 2))
}
