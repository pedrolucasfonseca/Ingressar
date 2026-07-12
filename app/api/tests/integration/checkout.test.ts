import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { createUser, makeEventData } from "../factories";

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

    it('serializa checkouts concorrentes no último ingresso: só um 201, o outro 409', async () => {
        const { user: organizer } = await createUser('org-race@test.com', 'organizer')
        const { token: buyer1Token } = await createUser('buyer-race-1@test.com', 'buyer')
        const { token: buyer2Token } = await createUser('buyer-race-2@test.com', 'buyer')
        const event = await prisma.event.create({ data: makeEventData(organizer.id, { capacity: 1 }) })

        const [res1, res2] = await Promise.all([
            request(app).post(`/events/${event.id}/checkout`).set('Authorization', `Bearer ${buyer1Token}`),
            request(app).post(`/events/${event.id}/checkout`).set('Authorization', `Bearer ${buyer2Token}`),
        ])

        const statuses = [res1.status, res2.status].sort()
        expect(statuses).toEqual([201, 409])

        const tickets = await prisma.ticket.findMany({ where: { eventId: event.id } })
        expect(tickets).toHaveLength(1)
    })
})