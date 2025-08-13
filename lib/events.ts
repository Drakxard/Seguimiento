export interface Event {
  id: string
  date: string
  name: string
  importance: number
  content: string
  daysRemaining: number
  theoryCompleted: number
  theoryTotal: number
  practiceCompleted: number
  practiceTotal: number
  isEditing: boolean
}

export let events: Event[] = []
