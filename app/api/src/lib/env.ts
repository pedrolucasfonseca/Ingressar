import { z } from "zod";

export const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET é obrigatória'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET é obrigatória'),
    JWT_EXPIRES_IN: z.string().default('15m'),
})

export type Env = z.infer<typeof EnvSchema>

// Puro, sem side effect no import. Só parseia e lança ZodError em caso de
// variável ausente ou inválida. Quem decide o que fazer com o erro (nesse
// caso, index.ts: loga e mata o processo) fica fora daqui, de propósito.
// Assim este módulo pode ser importado, por exemplo por um teste, sem
// arriscar um process.exit inesperado no meio da suíte.
export function parseEnv(source: Record<string, string | undefined>): Env {
    return EnvSchema.parse(source)
}
