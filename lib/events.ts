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
const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'events.json');

const defaultEvents: Event[] = [
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
];

export function loadEvents(): Event[] {
  try {
    if (!fs.existsSync(FILE)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(FILE, JSON.stringify(defaultEvents, null, 2));
      return defaultEvents;
    }
    const raw = fs.readFileSync(FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return defaultEvents;
  }
}

export function saveEvents(events: Event[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(events, null, 2));
}
