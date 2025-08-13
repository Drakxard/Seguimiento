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

const FILES = [
  path.join(process.cwd(), 'data', 'materias.json'),
  path.join('/tmp', 'materias.json')
];

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
  for (const file of FILES) {
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        return JSON.parse(raw);
      }
    } catch {
      // ignore and try next option
    }
  }
  return defaultState();
}

export function saveMaterias(state: MateriasState) {
  const content = JSON.stringify(state, null, 2);
  for (const file of FILES) {
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content);
      return;
    } catch {
      // ignore and try next path
    }
  }
}

export function daysLeft(fecha: string): number {
  return Math.ceil((new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
