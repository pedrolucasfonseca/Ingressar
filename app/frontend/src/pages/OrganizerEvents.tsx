import { Link } from 'react-router-dom'
import { useOrganizerEvents } from '../hooks/useOrganizerEvents'
import { formatCentsBRL, formatDate } from '../lib/format'
import type { EventStatus } from '../types/event'

const STATUS_LABEL: Record<EventStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  cancelled: 'Cancelado',
  finished: 'Finalizado',
}

export function OrganizerEvents() {
  const { data: events, isLoading, isError } = useOrganizerEvents()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Meus eventos</h1>
        <Link to="/organizer/events/new" className="border-2 border-ink bg-stamp px-4 py-2 font-mono text-sm text-paper dark:border-ink-dark">
          Novo evento
        </Link>
      </div>

      {isLoading && <p className="mt-8 font-mono text-sm text-perf">Carregando...</p>}
      {isError && <p role="alert" className="mt-8 text-sm text-stamp dark:text-stamp-dark">Não foi possível carregar seus eventos.</p>}
      {events && events.length === 0 && (
        <p className="mt-8 font-mono text-sm text-perf">Você ainda não criou nenhum evento.</p>
      )}

      {events && events.length > 0 && (
        <div className="mt-8 space-y-3">
          {events.map((event) => (
            <div key={event.id} className="ticket-card flex items-center justify-between p-4">
              <div>
                <h2 className="text-base leading-tight">{event.title}</h2>
                <p className="mt-1 font-mono text-xs text-perf">
                  {formatDate(event.date)} · {formatCentsBRL(event.priceCents)} · {STATUS_LABEL[event.status]}
                </p>
              </div>
              <div className="flex gap-4 font-mono text-sm">
                <Link to={`/organizer/events/${event.id}/edit`} className="underline underline-offset-2">Editar</Link>
                <Link to={`/organizer/events/${event.id}`} className="underline underline-offset-2">Dashboard</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
