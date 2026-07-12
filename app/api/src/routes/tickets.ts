import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import { publicLimiter } from "../middleware/rateLimiter";

export const ticketsRouter = Router()

ticketsRouter.get('/mine', publicLimiter, authMiddleware, async (req: AuthRequest, res) => {
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

ticketsRouter.get('/:id', publicLimiter, authMiddleware, async (req: AuthRequest, res) => {
    const ticket = await prisma.ticket.findUnique({
        where: { id: req.params['id'] as string },
        include: { event: true },
    })

    if (!ticket || ticket.userId !== req.user?.id) {
        res.status(404).json({ error: 'Ingresso não encontrado' })
        return
    }

    res.json(ticket)
})