import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";

describe('Rotas protegidas', () => {
    it('retorna 401 sem token', async () => {
        const res = await request(app).post('/events').send({})
        expect(res.status).toBe(401)
    })

    it('retorna 403 com role errada', async () => {
        await request(app).post('/auth/register').send({
            email: 'buyer@test.com', password: '123456', name: 'Buyer',
        })
        const login = await request(app).post('/auth/login').send({
            email: 'buyer@test.com', password: '123456',
        })

        const res = await request(app)
            .post('/events')
            .set('Authorization', `Bearer ${login.body.accessToken}`)
            .send({ title: 'Show', description: 'Desc', price: 1000, date: '2030-01-01T20:00:00Z', capacity: 10, location: 'SP' })

        expect(res.status).toBe(403)
    })
})

describe('POST /auth/reset-password', () => {
    it('retorna 400 para token expirado', async () => {
        const user = await prisma.user.create({
            data: { email: 'reset@test.com', name: 'Reset', passwordHash: 'x' },
        })
        const resetToken = await prisma.passwordResetToken.create({
            data: { userId: user.id, token: 'token-expirado', expiresAt: new Date(Date.now() - 1000) },
        })

        const res = await request(app).post('/auth/reset-password').send({
            token: resetToken.token, password: 'novaSenha123',
        })

        expect(res.status).toBe(400)
    })
})

describe('POST /auth/register (role)', () => {
    it('cria buyer por padrão quando role não é enviado', async () => {
        await request(app).post('/auth/register').send({
            email: 'default-role@test.com', password: '123456', name: 'Default',
        })
        const user = await prisma.user.findUnique({ where: { email: 'default-role@test.com' } })
        expect(user?.role).toBe('buyer')
    })

    it('cria organizer quando role: organizer é enviado', async () => {
        const res = await request(app).post('/auth/register').send({
            email: 'self-organizer@test.com', password: '123456', name: 'Organizador', role: 'organizer',
        })
        expect(res.status).toBe(201)
        const user = await prisma.user.findUnique({ where: { email: 'self-organizer@test.com' } })
        expect(user?.role).toBe('organizer')
    })
})
