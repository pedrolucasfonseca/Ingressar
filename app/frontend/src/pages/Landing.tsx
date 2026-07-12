import { useEvents } from '../hooks/useEvents'
import { EventCard, EventCardSkeleton } from '../components/EventCard'

export function Landing() {
  const { data, isLoading, isError } = useEvents({ limit: 24 })

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl">Próximos eventos</h1>
      <p className="mt-2 font-mono text-sm text-perf">shows, workshops e festas com ingresso garantido</p>

      {isError && <p role="alert" className="mt-8 font-mono text-sm text-stamp dark:text-stamp-dark">Não foi possível carregar os eventos.</p>}

      {isLoading && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      )}

      {data && data.data.length === 0 && (
        <p className="mt-8 font-mono text-sm text-perf">Nenhum evento publicado ainda. Volte em breve.</p>
      )}

      {data && data.data.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((event, i) => (
            <EventCard key={event.id} event={event} style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }} />
          ))}
        </div>
      )}
    </div>
  )
}