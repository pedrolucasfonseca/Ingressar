import { prismaMock } from "../setup";

jest.mock('../../src/lib/stripe', () => ({
    stripe: { checkout: { sessions: { create: jest.fn() } } },
}))

import { stripe } from '../../src/lib/stripe'
import { createCheckoutSession } from '../../src/lib/checkout'

const stripeCreateMock = stripe.checkout.sessions.create as jest.Mock

function mockEvent(overrides: Record<string, unknown> = {}) {
    return {
        id: 'ev-1',
        title: 'Show de teste',
        priceCents: 5000,
        capacity: 10,
        status: 'published',
        date: new Date('2099-01-01T20:00:00Z'),
        ...overrides,
    }
}

beforeEach(() => {
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock))
    stripeCreateMock.mockReset()
    stripeCreateMock.mockResolvedValue({ client_secret: 'secret_abc' })
})

describe('createCheckoutSession', () => {
    it('lança CheckoutError 409 se o evento está esgotado', async () => {
        prismaMock.$queryRaw.mockResolvedValue([mockEvent({ capacity: 1 })])
        prismaMock.ticket.count.mockResolvedValue(1)

        await expect(createCheckoutSession('ev-1', 'user-1')).rejects.toMatchObject(
            { status: 409, message: 'Evento esgotado' },
        )
    })

    it('lança CheckoutError 400 se a data do evento já passou', async () => {
        prismaMock.$queryRaw.mockResolvedValue([mockEvent({ date: new Date('2020-01-01') })])

        await expect(createCheckoutSession('ev-1', 'user-1')).rejects.toMatchObject(
            { status: 400, message: 'Evento já ocorreu' },
        )
    })

    it('lança CheckoutError 400 se o evento não está published', async () => {
        prismaMock.$queryRaw.mockResolvedValue([mockEvent({ status: 'draft' })])

        await expect(createCheckoutSession('ev-1', 'user-1')).rejects.toMatchObject(
            { status: 400, message: 'Evento não está disponível para compra' },
        )
    })

    it('lança CheckoutError 404 se o evento não existe', async () => {
        prismaMock.$queryRaw.mockResolvedValue([])

        await expect(createCheckoutSession('ev-1', 'user-1')).rejects.toMatchObject(
            { status: 404, message: 'Evento não encontrado' },
        )
    })

    it('cria a Checkout Session usando o id do ticket como idempotencyKey', async () => {
        prismaMock.$queryRaw.mockResolvedValue([mockEvent()])
        prismaMock.ticket.count.mockResolvedValue(0)
        prismaMock.ticket.create.mockResolvedValue({
            id: 'ticket-1', userId: 'user-1', eventId: 'ev-1', status: 'pending', qrCode: null, createdAt: new Date(),
        } as any)

        const result = await createCheckoutSession('ev-1', 'user-1')

        expect(stripeCreateMock).toHaveBeenCalledWith(expect.anything(), { idempotencyKey: 'ticket-1' })
        expect(result).toEqual({ clientSecret: 'secret_abc', ticketId: 'ticket-1' })
    })
})