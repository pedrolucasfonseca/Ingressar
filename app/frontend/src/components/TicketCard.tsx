import { Link } from 'react-router-dom'
import type { TicketWithEvent } from '../types/ticket'
import { formatDate } from '../lib/format'

const STATUS_LABEL: Record<TicketWithEvent['status'], string> = {
  pending: 'Aguardando pagamento',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
}

const STATUS_CLASS: Record<TicketWithEvent['status'], string> = {
  pending: 'text-gold dark:text-gold-dark',
  confirmed: 'text-stub dark:text-stub-dark',
  cancelled: 'text-stamp dark:text-stamp-dark',
}

export function TicketCard({ ticket }: { ticket: TicketWithEvent }) {
  return (
    <Link to={`/tickets/${ticket.id}`} className="ticket-card hover-lift fade-in-up flex items-center justify-between p-4">
      <div>
        <h2 className="text-base leading-tight">{ticket.event.title}</h2>
        <p className="mt-1 font-mono text-xs text-perf">{formatDate(ticket.event.date)} · {ticket.event.location}</p>
      </div>
      <span className={`font-mono text-sm font-medium ${STATUS_CLASS[ticket.status]}`}>
        {STATUS_LABEL[ticket.status]}
      </span>
    </Link>
  )
}
