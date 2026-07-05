import express from 'express'
import request from 'supertest'
import { authLimiter, publicLimiter, ticketLimiter } from '../../src/middleware/rateLimiter'

function appWith(limiter: express.RequestHandler) {
    const app = express()
    app.post('/test', limiter, (_req, res) => res.status(200).json({ ok: true }))
    return app
}

describe('authLimiter', () => {
    it('retorna 429 após 10 requisições em 1 minuto', async () => {
        const app = appWith(authLimiter)
        for (let i = 0; i < 10; i++) {
            await request(app).post('/test')
        }
        const res = await request(app).post('/test')
        expect(res.status).toBe(429)
    })
})

describe('publicLimiter', () => {
    it('retorna 429 após 60 requisições em 1 minuto', async () => {
        const app = appWith(publicLimiter)
        for (let i = 0; i < 60; i++) {
            await request(app).post('/test')
        }
        const res = await request(app).post('/test')
        expect(res.status).toBe(429)
    })
})

describe('ticketLimiter', () => {
    it('retorna 429 após 5 requisições em 1 minuto', async () => {
        const app = appWith(ticketLimiter)
        for (let i = 0; i < 5; i++) {
            await request(app).post('/test')
        }
        const res = await request(app).post('/test')
        expect(res.status).toBe(429)
    })
})