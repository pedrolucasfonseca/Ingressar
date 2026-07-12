import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'
import type { TicketWithEvent } from '../types/ticket'

export function useMyTickets() {
  return useQuery({
    queryKey: ['tickets', 'mine'],
    queryFn: async () => {
      const { data } = await api.get<TicketWithEvent[]>('/tickets/mine')
      return data
    },
  })
}
