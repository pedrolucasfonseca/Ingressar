import { Prisma } from "@prisma/client";
import { errorHandler } from "../../src/middleware/errorHandler";
import { AppError } from "../../src/lib/errors";

function mockReq() {
    return { method: 'GET', originalUrl: '/events/ev-1/checkout' } as any
}

function mockRes(headersSent = false) {
    return {
        headersSent,
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as any
}

let consoleErrorSpy: jest.SpyInstance

beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
    consoleErrorSpy.mockRestore()
    delete process.env['NODE_ENV']
})

describe('errorHandler', () => {
    it('repassa pro next() sem tocar a resposta se headers já foram enviados', () => {
        const res = mockRes(true)
        const next = jest.fn()
        const err = new Error('tarde demais')

        errorHandler(err, mockReq(), res, next)

        expect(next).toHaveBeenCalledWith(err)
        expect(res.status).not.toHaveBeenCalled()
    })

    it('usa status e message de um AppError', () => {
        const res = mockRes()
        errorHandler(new AppError(409, 'Evento esgotado'), mockReq(), res, jest.fn())

        expect(res.status).toHaveBeenCalledWith(409)
        expect(res.json).toHaveBeenCalledWith({ error: 'Evento esgotado' })
    })

    it('usa status e message de uma subclasse de AppError', () => {
        class CheckoutError extends AppError {}
        const res = mockRes()
        errorHandler(new CheckoutError(400, 'Evento já ocorreu'), mockReq(), res, jest.fn())

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ error: 'Evento já ocorreu' })
    })

    it('mapeia Prisma P2002 (unique constraint) pra 409', () => {
        const res = mockRes()
        const err = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002', clientVersion: '7.0.0',
        })

        errorHandler(err, mockReq(), res, jest.fn())

        expect(res.status).toHaveBeenCalledWith(409)
        expect(res.json).toHaveBeenCalledWith({ error: 'Requisição inválida' })
    })

    it('mapeia Prisma P2025 (registro não encontrado) pra 404', () => {
        const res = mockRes()
        const err = new Prisma.PrismaClientKnownRequestError('Record not found', {
            code: 'P2025', clientVersion: '7.0.0',
        })

        errorHandler(err, mockReq(), res, jest.fn())

        expect(res.status).toHaveBeenCalledWith(404)
    })

    it('erro do Prisma sem mapeamento cai no 500 genérico', () => {
        const res = mockRes()
        const err = new Prisma.PrismaClientKnownRequestError('Foreign key violation', {
            code: 'P2003', clientVersion: '7.0.0',
        })

        errorHandler(err, mockReq(), res, jest.fn())

        expect(res.status).toHaveBeenCalledWith(500)
    })

    it('em produção, esconde a mensagem real de um erro não mapeado', () => {
        process.env['NODE_ENV'] = 'production'
        const res = mockRes()

        errorHandler(new Error('detalhe interno sensível'), mockReq(), res, jest.fn())

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno' })
    })

    it('fora de produção, expõe a mensagem real de um erro não mapeado', () => {
        process.env['NODE_ENV'] = 'development'
        const res = mockRes()

        errorHandler(new Error('detalhe interno sensível'), mockReq(), res, jest.fn())

        expect(res.json).toHaveBeenCalledWith({ error: 'detalhe interno sensível' })
    })

    it('erro não é uma instância de Error (ex: throw de string) ainda retorna 500 genérico', () => {
        process.env['NODE_ENV'] = 'production'
        const res = mockRes()

        errorHandler('algo deu errado' as any, mockReq(), res, jest.fn())

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'Erro interno' })
    })
})
