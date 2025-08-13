import fs from "fs";
import path from "path";
import { Track, initialTracks } from "./tracks";
import { DayStats, defaultDayStats, resetDayIfNeeded } from "./dayStats";

export interface State {
  tracks: Track[];
  dayStats: DayStats;
  processed: Record<string, any>;
}

const STATE_PATH = path.join(process.cwd(), "data/state.json");

let state: State | null = null;

function loadFromDisk(): State {
  try {
    const raw = fs.readFileSync(STATE_PATH, "utf8");
    return JSON.parse(raw) as State;
  } catch {
    return {
      tracks: initialTracks.map((t) => ({ ...t })),
      dayStats: defaultDayStats(),
      processed: {},
    };
  }
}

export function loadState(): State {
  if (!state) {
    state = loadFromDisk();
  }
  return state;
}

export function saveState() {
  if (!state) return;
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

export { resetDayIfNeeded };
