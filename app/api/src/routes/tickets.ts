import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import { ticketLimiter } from "../middleware/rateLimiter";

export const ticketsRouter = Router()

const CreateTicketSchema = z.object({
    eventId: z.string().min(1),
})

ticketsRouter.post('/', ticketLimiter, authMiddleware, requireRole('buyer'), async (req: AuthRequest, res) => {
    const parsed = CreateTicketSchema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }
    const { eventId } = parsed.data
    const userId = req.user?.id

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
    const userId = req.user?.id

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