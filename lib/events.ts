export interface Event {
  id: string
  date: string
  name: string
  importance: number
  content: string
  daysRemaining: number
  isEditing: boolean
}

export let events: Event[] = []
