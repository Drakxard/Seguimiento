import fs from 'fs';
import path from 'path';

export interface Event {
  id: string;
  date: string;
  name: string;
  importance: number;
  content: string;
  completed: number;
  total: number;
  daysRemaining: number;
  isEditing: boolean;
}

export interface EventsState {
  events: Event[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'events.json');

function defaultState(): EventsState {
  return {
    events: [
      {
        id: '1',
        date: '2025-08-26',
        name: '1° seg',
        importance: 2,
        content: 'Sem 1 a 2',
        completed: 0,
        total: 0,
        daysRemaining: 0,
        isEditing: false,
      },
      {
        id: '2',
        date: '2025-08-31',
        name: '1° seg',
        importance: 2,
        content: 'Base Cabio base',
        completed: 0,
        total: 0,
        daysRemaining: 0,
        isEditing: false,
      },
      {
        id: '3',
        date: '2025-09-21',
        name: '1° Parcial',
        importance: 2,
        content: 'U1 A U4',
        completed: 0,
        total: 0,
        daysRemaining: 0,
        isEditing: false,
      },
    ],
  };
}

export function loadEvents(): EventsState {
  try {
    if (!fs.existsSync(FILE)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const init = defaultState();
      fs.writeFileSync(FILE, JSON.stringify(init, null, 2));
      return init;
    }
    const raw = fs.readFileSync(FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return defaultState();
  }
}

export function saveEvents(state: EventsState) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
}
