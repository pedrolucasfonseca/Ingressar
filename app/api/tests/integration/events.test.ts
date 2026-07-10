import request from 'supertest'
import { app } from '../../src/app'
import { prisma } from '../../src/lib/prisma'
import { signAccessToken } from '../../src/lib/tokens'

async function createOrganizer(email: string) {
    const user = await prisma.user.create({
        data: { email, name: 'Organizer', passwordHash: 'x', role: 'organizer' },
    })
    return { user, token: signAccessToken(user.id, 'organizer') }
}

function makeEventData(organizerId: string, overrides: Partial<Parameters<typeof prisma.event.create>[0]['data']> = {}) {
    return {
        title: 'Show de teste',
        description: 'Desc',
        priceCents: 1000,
        date: new Date('2030-01-01T20:00:00Z'),
        location: 'SP',
        capacity: 10,
        organizerId,
        ...overrides,
    }
}

describe('GET /events — paginação', () => {
    it('lista apenas eventos published, respeitando page/limit', async () => {
        const { user } = await createOrganizer('org-pag@test.com')

        await prisma.event.create({ data: makeEventData(user.id, { title: 'Draft', status: 'draft' }) })
        await prisma.event.create({ data: makeEventData(user.id, { title: 'Pub 1', status: 'published', date: new Date('2030-01-01') }) })
        await prisma.event.create({ data: makeEventData(user.id, { title: 'Pub 2', status: 'published', date: new Date('2030-02-01') }) })
        await prisma.event.create({ data: makeEventData(user.id, { title: 'Pub 3', status: 'published', date: new Date('2030-03-01') }) })

        const res = await request(app).get('/events').query({ page: 1, limit: 2, sort: 'date', order: 'asc' })

        expect(res.status).toBe(200)
        expect(res.body.data).toHaveLength(2)
        expect(res.body.data.every((e: { status: string }) => e.status === 'published')).toBe(true)
        expect(res.body.pagination).toEqual({
            page: 1, limit: 2, total: 3, totalPages: 2, hasNext: true, hasPrev: false,
        })
    })
})

describe('GET /events/:id/dashboard', () => {
    it('retorna o shape esperado, ignorando tickets cancelados', async () => {
        const { user, token } = await createOrganizer('org-dash@test.com')
        const buyer = await prisma.user.create({
            data: { email: 'buyer-dash@test.com', name: 'Buyer', passwordHash: 'x' },
        })
        const event = await prisma.event.create({
            data: makeEventData(user.id, { status: 'published', priceCents: 5000, capacity: 10 }),
        })

        await prisma.ticket.create({ data: { userId: buyer.id, eventId: event.id, status: 'confirmed' } })
        await prisma.ticket.create({ data: { userId: buyer.id, eventId: event.id, status: 'pending' } })
        await prisma.ticket.create({ data: { userId: buyer.id, eventId: event.id, status: 'cancelled' } })

        const res = await request(app)
            .get(`/events/${event.id}/dashboard`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(res.body).toMatchObject({
            ticketsSold: 2,
            revenueCents: 10000,
            capacityRemaining: 8,
        })
        expect(Array.isArray(res.body.salesByDay)).toBe(true)
    })
})

describe('PATCH /events/:id — transições de status', () => {
    it('aplica uma transição válida', async () => {
        const { user, token } = await createOrganizer('org-status-ok@test.com')
        const event = await prisma.event.create({ data: makeEventData(user.id, { status: 'draft' }) })

        const res = await request(app)
            .patch(`/events/${event.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'published' })

        expect(res.status).toBe(200)
        expect(res.body.status).toBe('published')
    })

    it('rejeita uma transição inválida', async () => {
        const { user, token } = await createOrganizer('org-status-bad@test.com')
        const event = await prisma.event.create({ data: makeEventData(user.id, { status: 'published' }) })

        const res = await request(app)
            .patch(`/events/${event.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'draft' })

        expect(res.status).toBe(400)
    })

    it('retorna 403 ao tentar mudar status de evento de outro organizer', async () => {
        const { user: owner } = await createOrganizer('org-owner@test.com')
        const { token: otherToken } = await createOrganizer('org-other@test.com')
        const event = await prisma.event.create({ data: makeEventData(owner.id, { status: 'draft' }) })

        const res = await request(app)
            .patch(`/events/${event.id}`)
            .set('Authorization', `Bearer ${otherToken}`)
            .send({ status: 'published' })

        expect(res.status).toBe(403)
    })
})
