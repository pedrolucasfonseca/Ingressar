export type EventStatus = 'draft' | 'published' | 'cancelled' | 'finished'

export interface Event {
  id: string
  title: string
  description: string
  priceCents: number
  date: string
  location: string
  capacity: number
  bannerUrl: string | null
  organizerId: string
  status: EventStatus
  createdAt: string
  updatedAt: string
}

export interface PaginatedEvents {
  data: Event[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface EventDashboard {
  ticketsSold: number
  revenueCents: number
  capacityRemaining: number
  /** Confirmados / total vendido (não-cancelado). Não é conversão de funil (visita → compra). */
  confirmationRate: number
  salesByDay: { date: string; count: number }[]
}
