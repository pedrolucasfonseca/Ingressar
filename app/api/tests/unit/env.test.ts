import { parseEnv } from "../../src/lib/env";

const VALID_ENV = {
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    JWT_SECRET: 'secret',
    JWT_REFRESH_SECRET: 'other-secret',
}

describe('parseEnv', () => {
    it('aceita o conjunto mínimo de variáveis obrigatórias, com defaults pro resto', () => {
        const env = parseEnv(VALID_ENV)

        expect(env).toMatchObject({
            NODE_ENV: 'development',
            PORT: 3001,
            JWT_EXPIRES_IN: '15m',
            DATABASE_URL: VALID_ENV.DATABASE_URL,
            JWT_SECRET: VALID_ENV.JWT_SECRET,
            JWT_REFRESH_SECRET: VALID_ENV.JWT_REFRESH_SECRET,
        })
    })

    it('rejeita quando DATABASE_URL está ausente', () => {
        const { DATABASE_URL, ...rest } = VALID_ENV
        expect(() => parseEnv(rest)).toThrow()
    })

    it('rejeita quando JWT_SECRET está ausente', () => {
        const { JWT_SECRET, ...rest } = VALID_ENV
        expect(() => parseEnv(rest)).toThrow()
    })

    it('rejeita quando JWT_REFRESH_SECRET está ausente', () => {
        const { JWT_REFRESH_SECRET, ...rest } = VALID_ENV
        expect(() => parseEnv(rest)).toThrow()
    })

    it('rejeita PORT com tipo inválido (não numérico)', () => {
        expect(() => parseEnv({ ...VALID_ENV, PORT: 'not-a-number' })).toThrow()
    })

    it('rejeita NODE_ENV fora do enum permitido', () => {
        expect(() => parseEnv({ ...VALID_ENV, NODE_ENV: 'staging' })).toThrow()
    })

    it('aceita PORT customizado, coagido de string pra número', () => {
        const env = parseEnv({ ...VALID_ENV, PORT: '4000' })
        expect(env.PORT).toBe(4000)
    })
})
