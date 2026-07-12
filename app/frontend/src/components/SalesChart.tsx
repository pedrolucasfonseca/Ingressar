import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function SalesChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="font-mono text-sm text-perf">Ainda sem vendas registradas.</p>
  }

  return (
    <div className="h-64 w-full" role="img" aria-label="Gráfico de ingressos vendidos por dia">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--color-perf)" />
          <XAxis dataKey="date" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} stroke="var(--color-ink)" />
          <YAxis allowDecimals={false} tick={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} stroke="var(--color-ink)" />
          <Tooltip
            contentStyle={{ background: 'var(--color-card)', border: '2px solid var(--color-ink)', fontFamily: 'var(--font-mono)' }}
          />
          <Line type="monotone" dataKey="count" name="Vendidos" stroke="var(--color-stub)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
