import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";

describe('erro não tratado numa rota', () => {
    it('retorna 500 com o JSON padronizado, sem vazar a mensagem real', async () => {
        const originalNodeEnv = process.env['NODE_ENV']
        process.env['NODE_ENV'] = 'production'
        const findUniqueSpy = jest.spyOn(prisma.event, 'findUnique')
            .mockRejectedValueOnce(new Error('detalhe interno sensível do banco'))

        try {
            const res = await request(app).get('/events/algum-id')

            expect(res.status).toBe(500)
            expect(res.body).toEqual({ error: 'Erro interno' })
        } finally {
            findUniqueSpy.mockRestore()
            process.env['NODE_ENV'] = originalNodeEnv
        }
    })
})
