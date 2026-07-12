import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'
import type { EventDashboard } from '../types/event'

export function useDashboard(eventId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard', eventId],
    queryFn: async () => {
      const { data } = await api.get<EventDashboard>(`/events/${eventId}/dashboard`)
      return data
    },
    enabled: !!eventId,
  })
}
