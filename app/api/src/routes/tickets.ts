import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import { ticketLimiter } from "../middleware/rateLimiter";

export const ticketsRouter = Router()

ticketsRouter.post('/', ticketLimiter, authMiddleware, async (req: AuthRequest, res) => {
    const { eventId } = req.body as { eventId: string }
    const userId = req.userId

    if (!userId) {
        res.status(401).json({ error: 'Não autenticado' })
        return
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
        res.status(404).json({ error: 'Evento não encontrado' })
        return
    }

    // Verificação de capacidade não implementada aqui — será feita de forma
    // atômica junto com a intenção de pagamento do Stripe para evitar race conditions.
    const ticket = await prisma.ticket.create({ data: { userId, eventId } })
    res.status(201).json(ticket)
})

ticketsRouter.get('/mine', authMiddleware, async (req: AuthRequest, res) => {
    const userId = req.userId

    if (!userId) {
        res.status(401).json({ error: 'Não autenticado' })
        return
    }

    const tickets = await prisma.ticket.findMany({
        where: { userId },
        include: { event: true },
    })

    res.json(tickets)
})