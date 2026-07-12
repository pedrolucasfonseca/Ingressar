import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { createOrganizer, makeEventData } from "../factories";

describe('GET /events/:id/preview', () => {
    it('retorna 404 se o evento não existe', async () => {
        const res = await request(app).get('/events/inexistente/preview')
        expect(res.status).toBe(404)
    })

    it('retorna HTML com og tags a partir dos dados do evento', async () => {
        const { user } = await createOrganizer('org-preview-ok@test.com')
        const event = await prisma.event.create({
            data: makeEventData(user.id, { title: 'Show incrível', description: 'Uma noite inesquecível' }),
        })

        const res = await request(app).get(`/events/${event.id}/preview`)

        expect(res.status).toBe(200)
        expect(res.headers['content-type']).toContain('text/html')
        expect(res.text).toContain('og:title" content="Show incrível"')
        expect(res.text).toContain('og:description" content="Uma noite inesquecível"')
        expect(res.text).toContain(`og:url" content="https://ingressar.app/events/${event.id}"`)
    })

    it('escapa HTML no title/description controlados pelo organizer', async () => {
        const { user } = await createOrganizer('org-preview-xss@test.com')
        const event = await prisma.event.create({
            data: makeEventData(user.id, {
                title: '<script>alert(1)</script>',
                description: 'Aspas " e & e <tag>',
            }),
        })

        const res = await request(app).get(`/events/${event.id}/preview`)

        expect(res.status).toBe(200)
        expect(res.text).not.toContain('<script>alert(1)</script>')
        expect(res.text).toContain('&lt;script&gt;')
        expect(res.text).not.toContain('content="Aspas " e')
    })
})
