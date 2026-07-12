import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useEvent } from '../hooks/useEvent'
import { useCheckout } from '../hooks/useCheckout'
import { PaymentForm } from '../components/PaymentForm'
import { formatCentsBRL } from '../lib/format'

export function Checkout() {
  const { eventId } = useParams<{ eventId: string }>()
  const { data: event } = useEvent(eventId)
  const checkout = useCheckout(eventId)

  useEffect(() => {
    if (eventId) checkout.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl">Finalizar compra</h1>
      {event && (
        <p className="mt-2 font-mono text-sm text-perf">
          {event.title} · {formatCentsBRL(event.priceCents)}
        </p>
      )}

      <div className="mt-8">
        {checkout.isPending && <p className="font-mono text-sm text-perf">Preparando pagamento...</p>}

        {checkout.isError && (
          <div role="alert">
            <p className="text-sm text-stamp dark:text-stamp-dark">
              {(checkout.error as any).response?.data?.error ?? 'Não foi possível iniciar o checkout.'}
            </p>
            <Link to={eventId ? `/events/${eventId}` : '/'} className="mt-4 inline-block underline underline-offset-2">
              Voltar
            </Link>
          </div>
        )}

        {checkout.data && <PaymentForm clientSecret={checkout.data.clientSecret} ticketId={checkout.data.ticketId} />}
      </div>
    </div>
  )
}
