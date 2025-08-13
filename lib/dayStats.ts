import fs from "fs"
import path from "path"
import { Subject } from "./tracks"

export interface DayStats {
  date: string // YYYY-MM-DD
  actsToday: Record<string, number>
  minutesToday: Record<Subject, number>
}

const dayStatsFile = path.join(process.cwd(), "data", "dayStats.json")

export const dayStats: DayStats = JSON.parse(
  fs.readFileSync(dayStatsFile, "utf-8")
)

export function saveDayStats() {
  fs.writeFileSync(dayStatsFile, JSON.stringify(dayStats, null, 2))
}

export function resetDayIfNeeded() {
  const today = new Date().toISOString().slice(0, 10)
  if (dayStats.date !== today) {
    dayStats.date = today
    dayStats.actsToday = {}
    dayStats.minutesToday = {
      "Álgebra": 0,
      "Cálculo": 0,
      POO: 0,
    }
    saveDayStats()
  }
}
