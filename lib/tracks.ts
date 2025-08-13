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

// Track data is persisted on disk in JSON files. This file only
// defines the TypeScript types used across the scheduling logic.
