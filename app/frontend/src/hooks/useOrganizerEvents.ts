import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'
import type { Event, EventStatus } from '../types/event'

export function useOrganizerEvents() {
  return useQuery({
    queryKey: ['events', 'mine'],
    queryFn: async () => {
      const { data } = await api.get<Event[]>('/events/mine')
      return data
    },
  })
}

export interface EventFormInput {
  title: string
  description: string
  price: number
  date: string
  capacity: number
  location: string
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: EventFormInput) => {
      const { data } = await api.post<Event>('/events', input)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', 'mine'] }),
  })
}

export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<EventFormInput> & { status?: EventStatus; bannerUrl?: string }) => {
      const { data } = await api.patch<Event>(`/events/${eventId}`, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
    },
  })
}
