import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { createOrganizer, makeEventData } from "../factories";

describe('POST /events/:id/banner-upload-url', () => {
    it('retorna 403 se quem pede não é o dono do evento', async () => {
        const { user: owner } = await createOrganizer('org-banner-owner@test.com')
        const { token: otherToken } = await createOrganizer('org-banner-other@test.com')
        const event = await prisma.event.create({ data: makeEventData(owner.id) })

        const res = await request(app)
            .post(`/events/${event.id}/banner-upload-url`)
            .set('Authorization', `Bearer ${otherToken}`)
            .send({ contentType: 'image/png' })

        expect(res.status).toBe(403)
    })

    it('rejeita content-type fora da whitelist com 400', async () => {
        const { user, token } = await createOrganizer('org-banner-badtype@test.com')
        const event = await prisma.event.create({ data: makeEventData(user.id) })

        const res = await request(app)
            .post(`/events/${event.id}/banner-upload-url`)
            .set('Authorization', `Bearer ${token}`)
            .send({ contentType: 'application/pdf' })

        expect(res.status).toBe(400)
    })

    it('retorna {uploadUrl, publicUrl} para content-type válido', async () => {
        const { user, token } = await createOrganizer('org-banner-ok@test.com')
        const event = await prisma.event.create({ data: makeEventData(user.id) })

        const res = await request(app)
            .post(`/events/${event.id}/banner-upload-url`)
            .set('Authorization', `Bearer ${token}`)
            .send({ contentType: 'image/jpeg' })

        expect(res.status).toBe(200)
        expect(typeof res.body.uploadUrl).toBe('string')
        expect(typeof res.body.publicUrl).toBe('string')
        expect(res.body.publicUrl).toContain(`banners/${event.id}/`)
    })
})

describe('PATCH /events/:id (bannerUrl)', () => {
    it('grava bannerUrl no evento', async () => {
        const { user, token } = await createOrganizer('org-banner-patch@test.com')
        const event = await prisma.event.create({ data: makeEventData(user.id) })
        const bannerUrl = 'http://localhost:9000/event-banners/banners/xyz.png'

        const res = await request(app)
            .patch(`/events/${event.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ bannerUrl })

        expect(res.status).toBe(200)
        expect(res.body.bannerUrl).toBe(bannerUrl)
    })
})
