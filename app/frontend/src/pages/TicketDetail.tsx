import { useParams } from 'react-router-dom'
import { useTicket } from '../hooks/useTicket'
import { ConfirmedStamp } from '../components/ConfirmedStamp'
import { formatDateTime } from '../lib/format'

export function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: ticket, isLoading, isError } = useTicket(id)

  if (isLoading) return <p className="mx-auto max-w-md px-4 py-16 font-mono text-sm text-perf">Carregando ingresso...</p>
  if (isError || !ticket) return <p className="mx-auto max-w-md px-4 py-16">Ingresso não encontrado.</p>

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="relative">
        {ticket.status === 'confirmed' && <ConfirmedStamp />}
        <div className="ticket-card">
          <div className="p-6 text-center">
            <p className="font-mono text-xs uppercase tracking-wide text-perf">Admite um</p>
            <h1 className="mt-1 text-2xl leading-tight">{ticket.event.title}</h1>
            <p className="mt-2 font-mono text-sm text-perf">{formatDateTime(ticket.event.date)} · {ticket.event.location}</p>
          </div>

          <div className="perf-line mx-0" />

          <div className="flex flex-col items-center gap-3 p-6">
            {ticket.status === 'pending' && (
              <p role="status" aria-live="polite" className="font-mono text-sm text-gold dark:text-gold-dark">
                Aguardando confirmação do pagamento...
              </p>
            )}
            {ticket.status === 'cancelled' && (
              <p role="status" className="font-mono text-sm text-stamp dark:text-stamp-dark">Ingresso cancelado.</p>
            )}
            {ticket.qrCode ? (
              <img
                src={ticket.qrCode}
                alt={`QR code do ingresso para ${ticket.event.title} — ID ${ticket.id}`}
                className="h-40 w-40"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center border-2 border-dashed border-perf font-mono text-xs text-perf">
                QR pendente
              </div>
            )}
            <p className="font-mono text-xs text-perf">#{ticket.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
