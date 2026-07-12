import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'
import type { Event } from '../types/event'

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await api.get<Event>(`/events/${id}`)
      return data
    },
    enabled: !!id,
    staleTime: 30_000,
  })
}
