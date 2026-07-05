import jwt from 'jsonwebtoken'
import { authMiddleware, requireRole, requireEventOwner } from '../../src/middleware/auth'
import { prismaMock } from '../setup'

function mockRes() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        clearCookie: jest.fn(),
        cookie: jest.fn(),
        send: jest.fn(),
    } as any
}

describe('authMiddleware', () => {
    beforeEach(() => {
        process.env['JWT_SECRET'] = 'test-secret'
    })

    it('retorna 401 sem header de autorização', () => {
        const req = { headers: {} } as any
        const res = mockRes()
        authMiddleware(req, res, jest.fn())
        expect(res.status).toHaveBeenCalledWith(401)
    })

    it('retorna 401 com token inválido', () => {
        const req = { headers: { authorization: 'Bearer token-invalido' } } as any
        const res = mockRes()
        authMiddleware(req, res, jest.fn())
        expect(res.status).toHaveBeenCalledWith(401)
    })

    it('retorna 401 com token expirado', () => {
        const expired = jwt.sign({ userId: 'user-1', role: 'buyer' }, 'test-secret', { expiresIn: -10 })
        const req = { headers: { authorization: `Bearer ${expired}` } } as any
        const res = mockRes()
        authMiddleware(req, res, jest.fn())
        expect(res.status).toHaveBeenCalledWith(401)
    })

    it('chama next() e popula req.user com token válido', () => {
        const token = jwt.sign({ userId: 'user-1', role: 'organizer' }, 'test-secret', { expiresIn: '15m' })
        const req = { headers: { authorization: `Bearer ${token}` } } as any
        const res = mockRes()
        const next = jest.fn()
        authMiddleware(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(req.user).toEqual({ id: 'user-1', role: 'organizer' })
    })
})

describe('requireRole', () => {
    it('chama next() se role bate', () => {
        const req = { user: { id: 'user-1', role: 'organizer' } } as any
        const next = jest.fn()
        requireRole('organizer')(req, mockRes(), next)
        expect(next).toHaveBeenCalled()
    })

    it('retorna 403 se role não bate', () => {
        const req = { user: { id: 'user-1', role: 'buyer' } } as any
        const res = mockRes()
        requireRole('organizer')(req, res, jest.fn())
        expect(res.status).toHaveBeenCalledWith(403)
    })
})

describe('requireEventOwner', () => {
    it('retorna 404 se evento não existe', async () => {
        prismaMock.event.findUnique.mockResolvedValue(null)
        const req = { params: { id: 'ev-1' }, user: { id: 'user-1', role: 'organizer' } } as any
        const res = mockRes()
        await requireEventOwner(req, res, jest.fn())
        expect(res.status).toHaveBeenCalledWith(404)
    })

    it('retorna 403 se evento pertence a outro organizer', async () => {
        prismaMock.event.findUnique.mockResolvedValue({ id: 'ev-1', organizerId: 'other-user' } as any)
        const req = { params: { id: 'ev-1' }, user: { id: 'user-1', role: 'organizer' } } as any
        const res = mockRes()
        await requireEventOwner(req, res, jest.fn())
        expect(res.status).toHaveBeenCalledWith(403)
    })

    it('chama next() e popula req.event se o organizer é o dono', async () => {
        const event = { id: 'ev-1', organizerId: 'user-1' }
        prismaMock.event.findUnique.mockResolvedValue(event as any)
        const req = { params: { id: 'ev-1' }, user: { id: 'user-1', role: 'organizer' } } as any
        const res = mockRes()
        const next = jest.fn()
        await requireEventOwner(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(req.event).toEqual(event)
    })
})
