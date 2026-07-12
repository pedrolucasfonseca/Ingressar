export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="ticket-card p-4">
      <p className="font-mono text-2xl font-medium">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-perf">{label}</p>
    </div>
  )
}
