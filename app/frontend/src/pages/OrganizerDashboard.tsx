import { useParams } from 'react-router-dom'
import { useEvent } from '../hooks/useEvent'
import { useDashboard } from '../hooks/useDashboard'
import { StatCard } from '../components/StatCard'
import { SalesChart } from '../components/SalesChart'
import { formatCentsBRL, formatPercent } from '../lib/format'

export function OrganizerDashboard() {
  const { id } = useParams<{ id: string }>()
  const { data: event } = useEvent(id)
  const { data: dashboard, isLoading, isError } = useDashboard(id)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl">{event ? event.title : 'Dashboard'}</h1>
      <p className="mt-1 font-mono text-sm text-perf">Métricas de vendas</p>

      {isLoading && <p className="mt-8 font-mono text-sm text-perf">Carregando...</p>}
      {isError && <p role="alert" className="mt-8 text-sm text-stamp dark:text-stamp-dark">Não foi possível carregar as métricas.</p>}

      {dashboard && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Vendidos" value={`${dashboard.ticketsSold} / ${dashboard.ticketsSold + dashboard.capacityRemaining}`} />
            <StatCard label="Receita" value={formatCentsBRL(dashboard.revenueCents)} />
            <StatCard label="Restantes" value={String(dashboard.capacityRemaining)} />
            <StatCard label="Confirmados" value={formatPercent(dashboard.confirmationRate)} />
          </div>

          <div className="ticket-card mt-8 p-5">
            <h2 className="text-lg">Vendas por dia</h2>
            <div className="mt-4">
              <SalesChart data={dashboard.salesByDay} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
