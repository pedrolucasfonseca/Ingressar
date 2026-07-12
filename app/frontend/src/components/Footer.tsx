export function Footer() {
  return (
    <footer className="mt-16">
      <div className="perf-line mx-4" />
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 font-mono text-xs text-perf sm:flex-row sm:items-center sm:justify-between">
        <p>Ingressar — ingresso é ingresso, sem taxa escondida.</p>
        <p>&copy; {new Date().getFullYear()} Ingressar. Pagamentos processados via Stripe.</p>
      </div>
    </footer>
  )
}
