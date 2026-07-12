import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'
import type { PaginatedEvents } from '../types/event'

export interface EventsQuery {
  page?: number
  limit?: number
  sort?: 'date' | 'price' | 'createdAt'
  order?: 'asc' | 'desc'
}

export function useEvents(query: EventsQuery = {}) {
  return useQuery({
    queryKey: ['events', query],
    queryFn: async () => {
      const { data } = await api.get<PaginatedEvents>('/events', { params: query })
      return data
    },
    staleTime: 30_000,
  })
}
