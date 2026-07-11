import request from "supertest";
import type { Prisma } from "@prisma/client";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { signAccessToken } from "../../src/lib/tokens";

async function createUser(email: string, role: 'organizer' | 'buyer') {
    const user = await prisma.user.create({
        data: { email, name: 'User', passwordHash: 'x', role },
    })
    return { user, token: signAccessToken(user.id, role) }
}

function makeEventData(organizerId: string, overrides: Partial<Prisma.EventUncheckedCreateInput> = {}): Prisma.EventUncheckedCreateInput {
    return {
        title: 'Show de teste',
        description: 'Desc',
        priceCents: 5000,
        date: new Date('2099-01-01T20:00:00Z'),
        location: 'SP',
        capacity: 1,
        organizerId,
        status: 'published',
        ...overrides,
    }
}

describe('POST /events/:id/checkout', () => {
    it('retorna 403 se quem tenta comprar não é buyer', async () => {
        const { user: organizer, token } = await createUser('org-checkout@test.com', 'organizer')
        const event = await prisma.event.create({ data: makeEventData(organizer.id) })

        const res = await request(app)
            .post(`/events/${event.id}/checkout`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(403)
    })

    it('cria o ticket pending com FOR UPDATE real e retorna clientSecret + ticketId da Stripe', async () => {
        const { user: organizer } = await createUser('org-ok@test.com', 'organizer')
        const { user: buyer, token: buyerToken } = await createUser('buyer-ok@test.com', 'buyer')
        const event = await prisma.event.create({ data: makeEventData(organizer.id) })

        const res = await request(app)
            .post(`/events/${event.id}/checkout`)
            .set('Authorization', `Bearer ${buyerToken}`)

        expect(res.status).toBe(201)
        expect(typeof res.body.clientSecret).toBe('string')
        expect(res.body).toHaveProperty('ticketId')

        const ticket = await prisma.ticket.findUnique({ where: { id: res.body.ticketId } })
        expect(ticket).toMatchObject({ userId: buyer.id, eventId: event.id, status: 'pending' })
    })
})