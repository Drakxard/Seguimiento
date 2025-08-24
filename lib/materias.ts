import fs from 'fs';
import path from 'path';

export interface Materia {
  nombre: string;
  fecha: string;
  progreso: number;
  totaltareas: number;
  minutos: number;
}

export interface MateriasState {
  materias: Materia[];
}

const DATA_DIR = path.resolve(process.env.DATA_DIR || '/gestor/system');
const FILE = path.join(DATA_DIR, 'materias.json');

function defaultState(): MateriasState {
  return {
    materias: [
      { nombre: 'algebra', fecha: '2025-08-17', progreso: 0, totaltareas: 10, minutos: 0 },
      { nombre: 'calculo', fecha: '2025-08-18', progreso: 0, totaltareas: 10, minutos: 0 },
      { nombre: 'poo', fecha: '2025-08-21', progreso: 0, totaltareas: 10, minutos: 0 }
    ]
  };
}

export function loadMaterias(): MateriasState {
  try {
    if (!fs.existsSync(FILE)) {
      fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
      const init = defaultState();
      fs.writeFileSync(FILE, JSON.stringify(init, null, 2), { mode: 0o600 });
      return init;
    }
    const raw = fs.readFileSync(FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return defaultState();
  }
}

export function saveMaterias(state: MateriasState) {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  fs.writeFileSync(FILE, JSON.stringify(state, null, 2), { mode: 0o600 });
}

export function daysLeft(fecha: string): number {
  return Math.ceil((new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
