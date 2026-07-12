import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/axios'
import type { TicketWithEvent } from '../types/ticket'

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const { data } = await api.get<TicketWithEvent>(`/tickets/${id}`)
      return data
    },
    enabled: !!id,
    // Continua checando até confirmar. O webhook do Stripe (v0.7.0) atualiza
    // o status de forma assíncrona; o polling é como o client descobre a
    // mudança.
    refetchInterval: (query) => (query.state.data?.status === 'confirmed' ? false : 3000),
  })
}
