export type Subject = "Álgebra" | "Cálculo" | "POO";

export interface Track {
  slug: string;
  subject: Subject;
  R: number; // remaining acts
  classDate: string; // ISO date string
  nextIndex: number;
  lastTouched: number; // timestamp ms
  avgMinPerAct: number;
  active: boolean;
  doneActs: number;
}

export const tracks: Track[] = [
  {
    slug: "algebra-t",
    subject: "Álgebra",
    R: 5,
    classDate: "2025-08-17",
    nextIndex: 0,
    lastTouched: 0,
    avgMinPerAct: 50,
    active: true,
    doneActs: 0,
  },
  {
    slug: "algebra-p",
    subject: "Álgebra",
    R: 6,
    classDate: "2025-08-20",
    nextIndex: 0,
    lastTouched: 0,
    avgMinPerAct: 50,
    active: true,
    doneActs: 0,
  },
  {
    slug: "poo-t",
    subject: "POO",
    R: 1,
    classDate: "2025-08-18",
    nextIndex: 0,
    lastTouched: 0,
    avgMinPerAct: 50,
    active: true,
    doneActs: 0,
  },
  {
    slug: "poo-p",
    subject: "POO",
    R: 1,
    classDate: "2025-08-14",
    nextIndex: 0,
    lastTouched: 0,
    avgMinPerAct: 50,
    active: true,
    doneActs: 0,
  },
  {
    slug: "calculo-p",
    subject: "Cálculo",
    R: 1,
    classDate: "2025-08-18",
    nextIndex: 0,
    lastTouched: 0,
    avgMinPerAct: 50,
    active: true,
    doneActs: 0,
  },
  {
    slug: "calculo-t",
    subject: "Cálculo",
    R: 1,
    classDate: "2025-08-21",
    nextIndex: 0,
    lastTouched: 0,
    avgMinPerAct: 50,
    active: true,
    doneActs: 0,
  },
];
