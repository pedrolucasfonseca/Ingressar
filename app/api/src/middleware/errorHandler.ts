import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/errors";

// Códigos do Prisma que correspondem a um erro de cliente (4xx), não de servidor.
// Ver https://www.prisma.io/docs/orm/reference/error-reference. Qualquer código
// não listado aqui cai no 500 genérico: mapear errado é peor que não mapear.
const PRISMA_CLIENT_ERROR_STATUS: Record<string, number> = {
    P2002: 409, // unique constraint violation
    P2025: 404, // registro esperado não encontrado (ex: update/delete em id inexistente)
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    // Se a resposta já começou a ser enviada, não há mais o que fazer aqui além
    // de repassar pro handler default do Express. Chamar res.* de novo lançaria
    // "Cannot set headers after they are sent".
    if (res.headersSent) {
        next(err)
        return
    }

    // req.originalUrl é controlado pelo cliente. Passar como argumento de
    // substituição (%s), não como parte da format string, evita que um
    // specifier (%s, %d, %j...) na própria URL seja interpretado pelo
    // console.error/util.format.
    console.error('[%s %s]', req.method, req.originalUrl, err)

    if (err instanceof AppError) {
        res.status(err.status).json({ error: err.message })
        return
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const status = PRISMA_CLIENT_ERROR_STATUS[err.code]
        if (status) {
            res.status(status).json({ error: 'Requisição inválida' })
            return
        }
    }

    // Erro não mapeado. Nunca vaza mensagem/stack trace real em produção, pois
    // pode conter detalhes de schema, query ou paths internos.
    res.status(500).json({
        error: process.env['NODE_ENV'] === 'production'
            ? 'Erro interno'
            : err instanceof Error ? err.message : 'Erro interno',
    })
}
