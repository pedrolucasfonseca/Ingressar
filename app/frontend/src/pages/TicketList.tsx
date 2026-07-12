import { useMyTickets } from '../hooks/useMyTickets'
import { TicketCard } from '../components/TicketCard'

export function TicketList() {
  const { data: tickets, isLoading, isError } = useMyTickets()

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl">Meus ingressos</h1>

      {isLoading && <p className="mt-8 font-mono text-sm text-perf">Carregando...</p>}
      {isError && <p role="alert" className="mt-8 text-sm text-stamp dark:text-stamp-dark">Não foi possível carregar seus ingressos.</p>}
      {tickets && tickets.length === 0 && (
        <p className="mt-8 font-mono text-sm text-perf">Você ainda não comprou nenhum ingresso.</p>
      )}

      {tickets && tickets.length > 0 && (
        <div className="mt-8 space-y-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  )
}
