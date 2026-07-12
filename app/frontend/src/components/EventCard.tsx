import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Event } from '../types/event'
import { formatCentsBRL, formatDate } from '../lib/format'

export function EventCard({ event, style }: { event: Event; style?: CSSProperties }) {
  return (
    <Link to={`/events/${event.id}`} style={style} className="ticket-card hover-lift fade-in-up block">
      <div className="aspect-video w-full overflow-hidden border-b-2 border-ink dark:border-ink-dark">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-perf/20 font-display text-sm text-perf">
            SEM BANNER
          </div>
        )}
      </div>
      <div className="p-4 pb-6">
        <p className="font-mono text-xs text-perf">{formatDate(event.date)} · {event.location}</p>
        <h2 className="mt-1 text-lg leading-tight">{event.title}</h2>
      </div>
      <div className="perf-line mx-4" />
      <div className="flex items-center justify-between p-4 font-mono">
        <span className="text-lg font-medium text-stamp dark:text-stamp-dark">{formatCentsBRL(event.priceCents)}</span>
        <span className="text-sm text-perf">Ver ingresso</span>
      </div>
    </Link>
  )
}

export function EventCardSkeleton() {
  return (
    <div className="ticket-card animate-pulse" aria-hidden="true">
      <div className="aspect-video w-full border-b-2 border-ink bg-perf/20 dark:border-ink-dark" />
      <div className="space-y-2 p-4 pb-6">
        <div className="h-3 w-1/2 bg-perf/30" />
        <div className="h-5 w-3/4 bg-perf/30" />
      </div>
      <div className="perf-line mx-4" />
      <div className="flex items-center justify-between p-4">
        <div className="h-5 w-20 bg-perf/30" />
      </div>
    </div>
  )
}
