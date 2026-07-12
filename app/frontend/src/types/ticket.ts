import type { Event } from './event'

export type TicketStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Ticket {
  id: string
  userId: string
  eventId: string
  status: TicketStatus
  qrCode: string | null
  createdAt: string
}

export interface TicketWithEvent extends Ticket {
  event: Event
}
