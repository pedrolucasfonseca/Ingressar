import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { StripeCheckoutLoadActionsSuccess, StripePaymentElement } from '@stripe/stripe-js'
import { stripePromise } from '../lib/stripe'

// Checkout Session (ui_mode: 'elements') não é consumida pelo <Elements>/<PaymentElement>
// clássico do @stripe/react-stripe-js (esse espera client_secret de PaymentIntent/SetupIntent).
// stripe.initCheckoutElementsSdk é o SDK correto pra um client_secret de Checkout Session.
export function PaymentForm({ clientSecret, ticketId }: { clientSecret: string; ticketId: string }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<StripeCheckoutLoadActionsSuccess | null>(null)
  const [ready, setReady] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [cardError, setCardError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    let mountedElement: StripePaymentElement | null = null

    async function setup() {
      const stripe = await stripePromise
      if (!stripe || cancelled) return

      const sdk = await stripe.initCheckoutElementsSdk({ clientSecret })
      mountedElement = sdk.createPaymentElement()
      if (mountRef.current) mountedElement.mount(mountRef.current)

      const result = await sdk.loadActions()
      if (result.type !== 'success' || cancelled) return

      actionsRef.current = result.actions
      setReady(true)
    }

    setup()
    return () => {
      cancelled = true
      mountedElement?.unmount()
    }
  }, [clientSecret])

  async function handlePay(e: FormEvent) {
    e.preventDefault()
    if (!actionsRef.current) return
    setProcessing(true)
    setCardError('')
    try {
      const result = await actionsRef.current.confirm()
      if (result.type === 'error') {
        setCardError(result.error.message ?? 'Pagamento recusado')
      } else {
        navigate(`/tickets/${ticketId}`)
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handlePay} className="ticket-card p-5">
      <label htmlFor="payment-element" className="mb-2 block font-mono text-xs uppercase tracking-wide text-perf">
        Dados de pagamento
      </label>
      <div id="payment-element" ref={mountRef} aria-describedby="card-error" />
      <div id="card-error" role="alert" aria-live="polite" className="mt-3 min-h-5 text-sm text-stamp dark:text-stamp-dark">
        {cardError}
      </div>
      <button
        type="submit"
        disabled={!ready || processing}
        aria-disabled={!ready || processing}
        aria-busy={processing}
        className="mt-4 w-full border-2 border-ink bg-stamp py-3 font-mono font-medium text-paper disabled:opacity-60 dark:border-ink-dark"
      >
        {processing ? 'Processando...' : 'Pagar'}
      </button>
    </form>
  )
}
