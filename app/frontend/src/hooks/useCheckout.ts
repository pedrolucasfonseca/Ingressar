import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/axios'

export function useCheckout(eventId: string | undefined) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ clientSecret: string; ticketId: string }>(`/events/${eventId}/checkout`)
      return data
    },
  })
}
