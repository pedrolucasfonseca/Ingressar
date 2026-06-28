import rateLimit from "express-rate-limit"

// Brute force em login/register: 10 tentativas por minuto por IP
export const authLimiter = rateLimit({
    windowMs: 60_000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas tentativas. Tente novamente em 1 minuto.' },
})

// Leitura pública de eventos: 60 requisições por minuto por IP
export const publicLimiter = rateLimit({
    windowMs: 60_000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Limite de requisições atingido. Tente novamente em breve.' },
})

// Compra de ingresso: 5 por minuto por IP — previne criação massiva de tickets
export const ticketLimiter = rateLimit({
    windowMs: 60_000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas tentativas de compra. Aguarde 1 minuto.' },
})
