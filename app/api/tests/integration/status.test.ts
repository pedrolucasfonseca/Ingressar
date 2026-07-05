import request from 'supertest'
import { app } from '../../src/app'

describe('GET /status', () => {
    it('retorna 200', async () => {
        const res = await request(app).get('/status')
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('status', 'ok')
    })
})