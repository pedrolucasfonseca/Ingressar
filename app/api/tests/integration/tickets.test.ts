import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { createUser, makeEventData } from "../factories";

describe('GET /tickets/:id', () => {
    it('retorna o ingresso com o evento incluído, para o dono', async () => {
        const { user: organizer } = await createUser('org-ticket-get@test.com', 'organizer')
        const { user: buyer, token } = await createUser('buyer-ticket-get@test.com', 'buyer')
        const event = await prisma.event.create({ data: makeEventData(organizer.id) })
        const ticket = await prisma.ticket.create({ data: { userId: buyer.id, eventId: event.id, status: 'pending' } })

        const res = await request(app)
            .get(`/tickets/${ticket.id}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(res.body.id).toBe(ticket.id)
        expect(res.body.event.id).toBe(event.id)
    })

    it('retorna 404 se o ingresso pertence a outro usuário', async () => {
        const { user: organizer } = await createUser('org-ticket-404.a@test.com', 'organizer')
        const { user: buyer } = await createUser('buyer-ticket-404@test.com', 'buyer')
        const { token: otherToken } = await createUser('buyer-ticket-404.b@test.com', 'buyer')
        const event = await prisma.event.create({ data: makeEventData(organizer.id) })
        const ticket = await prisma.ticket.create({ data: { userId: buyer.id, eventId: event.id, status: 'pending' } })

        const res = await request(app)
            .get(`/tickets/${ticket.id}`)
            .set('Authorization', `Bearer ${otherToken}`)

        expect(res.status).toBe(404)
    })

    it('retorna 401 sem token', async () => {
        const res = await request(app).get('/tickets/algum-id')
        expect(res.status).toBe(401)
    })
})
