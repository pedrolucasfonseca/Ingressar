import rateLimit from "express-rate-limit"

// DISABLE_RATE_LIMIT=true, só pra rodar a suíte E2E (Playwright) contra uma
// API de dev/preview de vida longa. Diferente dos testes de integração do
// Jest (cada arquivo roda num processo isolado, com seu próprio estado de
// rate limit em memória), a suíte E2E inteira bate numa única instância
// persistente da API, e o mesmo IP facilmente esgota os limites de
// brute-force/checkout dentro de 1 minuto. Nunca deve ser setado em dev
// normal ou produção.
const skip = () => process.env['DISABLE_RATE_LIMIT'] === 'true'

// Brute force em login/register: 10 tentativas por minuto por IP
export const authLimiter = rateLimit({
    windowMs: 60_000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip,
    message: { error: 'Muitas tentativas. Tente novamente em 1 minuto.' },
})

// Leitura pública de eventos: 60 requisições por minuto por IP
export const publicLimiter = rateLimit({
    windowMs: 60_000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    skip,
    message: { error: 'Limite de requisições atingido. Tente novamente em breve.' },
})

// Compra de ingresso: 5 por minuto por IP. Previne criação massiva de tickets.
export const ticketLimiter = rateLimit({
    windowMs: 60_000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skip,
    message: { error: 'Muitas tentativas de compra. Aguarde 1 minuto.' },
})
