import { useParams, Link } from 'react-router-dom'
import { useEvent } from '../hooks/useEvent'
import { useAuth } from '../hooks/useAuth'
import { formatCentsBRL, formatDateTime } from '../lib/format'

export function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: event, isLoading, isError } = useEvent(id)
  const { user } = useAuth()

  if (isLoading) return <p className="mx-auto max-w-3xl px-4 py-16 font-mono text-sm text-perf">Carregando...</p>
  if (isError || !event) return <p className="mx-auto max-w-3xl px-4 py-16">Evento não encontrado.</p>

  // Capacidade só é validada no checkout. Evita duplicar a lógica de contagem aqui.
  const soldOut = false

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="aspect-[16/7] w-full overflow-hidden border-2 border-ink dark:border-ink-dark">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-perf/20 font-display text-perf">SEM BANNER</div>
        )}
      </div>

      <p className="mt-6 font-mono text-sm text-perf">{formatDateTime(event.date)} · {event.location}</p>
      <h1 className="mt-1 text-4xl">{event.title}</h1>
      <p className="mt-4 whitespace-pre-wrap font-sans">{event.description}</p>

      <div className="ticket-card mt-8 flex items-center justify-between p-5">
        <span className="font-mono text-2xl font-medium text-stamp dark:text-stamp-dark">{formatCentsBRL(event.priceCents)}</span>
        {user?.role === 'organizer' ? (
          <span className="font-mono text-sm text-perf">Organizadores não compram ingresso</span>
        ) : (
          <Link
            to={`/checkout/${event.id}`}
            aria-disabled={soldOut}
            className="border-2 border-ink bg-stamp px-6 py-3 font-mono font-medium text-paper dark:border-ink-dark"
          >
            Comprar ingresso
          </Link>
        )}
      </div>
    </div>
  )
}
