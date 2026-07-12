import type { Event } from "@prisma/client";
import { prisma } from "./prisma";
import { stripe } from "./stripe";
import { AppError } from "./errors";

export class CheckoutError extends AppError {}

export async function createCheckoutSession(eventId: string, userId: string): Promise<{ clientSecret: string; ticketId: string }> {
    const { ticket, event } = await prisma.$transaction(async (tx) => {
        // FOR UPDATE trava a linha do evento até o fim da transação, serializando
        // checkouts concorrentes que disputam o último ingresso disponível.
        const [event] = await tx.$queryRaw<Event[]>`SELECT * FROM "Event" WHERE id = ${eventId} FOR UPDATE`
        if (!event) throw new CheckoutError(404, 'Evento não encontrado')
        if (event.status !== 'published') throw new CheckoutError(400, 'Evento não está disponível para compra')
        if (event.date < new Date()) throw new CheckoutError(400, 'Evento já ocorreu')

        const soldCount = await tx.ticket.count({ where: { eventId, status: { not: 'cancelled' } } })
        if (soldCount >= event.capacity) throw new CheckoutError(409, 'Evento esgotado')

        const ticket = await tx.ticket.create({ data: { userId, eventId, status: 'pending' } })
        return { ticket, event }
    })

    // idempotencyKey = ticket.id: um retry do frontend (ex: timeout de rede) reusa a
    // mesma Checkout Session em vez de criar uma cobrança duplicada.
    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        ui_mode: 'elements',
        line_items: [{
            price_data: {
                currency: 'brl',
                unit_amount: event.priceCents,
                product_data: { name: event.title },
            },
            quantity: 1,
        }],
    }, { idempotencyKey: ticket.id })

    return { clientSecret: session.client_secret as string, ticketId: ticket.id }
}