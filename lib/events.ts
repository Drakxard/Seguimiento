export interface Event {
  id: string
  date: string
  name: string
  importance: number
  content: string
  theoryCompleted: number
  theoryTotal: number
  practiceCompleted: number
  practiceTotal: number
  daysRemaining: number
  isEditing: boolean
}

export const initialEvents: Event[] = [
  {
    id: "1",
    date: "2025-08-17",
    name: "T - Álgebra",
    importance: 2,
    content: "5.1 a 5.6",
    theoryCompleted: 1,
    theoryTotal: 6,
    practiceCompleted: 1,
    practiceTotal: 6,
    daysRemaining: 0,
    isEditing: false,
  },
  {
    id: "2",
    date: "2025-08-20",
    name: "P - Álgebra",
    importance: 2,
    content: "5.1 a 5.6",
    theoryCompleted: 1,
    theoryTotal: 6,
    practiceCompleted: 1,
    practiceTotal: 6,
    daysRemaining: 0,
    isEditing: false,
  },
  {
    id: "3",
    date: "2025-08-18",
    name: "T - Poo",
    importance: 2,
    content: "U1",
    theoryCompleted: 0,
    theoryTotal: 1,
    practiceCompleted: 0,
    practiceTotal: 1,
    daysRemaining: 0,
    isEditing: false,
  },
  {
    id: "4",
    date: "2025-08-14",
    name: "P - Poo",
    importance: 2,
    content: "U1",
    theoryCompleted: 0,
    theoryTotal: 1,
    practiceCompleted: 0,
    practiceTotal: 1,
    daysRemaining: 0,
    isEditing: false,
  },
  {
    id: "5",
    date: "2025-08-18",
    name: "P - Cálculo",
    importance: 2,
    content: "4.1 a 4.3",
    theoryCompleted: 0,
    theoryTotal: 1,
    practiceCompleted: 0,
    practiceTotal: 1,
    daysRemaining: 0,
    isEditing: false,
  },
  {
    id: "6",
    date: "2025-08-21",
    name: "T - Cálculo",
    importance: 2,
    content: "4.1 a 4.3",
    theoryCompleted: 0,
    theoryTotal: 1,
    practiceCompleted: 0,
    practiceTotal: 1,
    daysRemaining: 0,
    isEditing: false,
  },
]

export let events: Event[] = [...initialEvents]
