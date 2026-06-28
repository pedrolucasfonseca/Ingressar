import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import { publicLimiter } from "../middleware/rateLimiter";

export const eventsRouter = Router()

eventsRouter.get('/', publicLimiter, async (_req, res) => {
    const events = await prisma.event.findMany({ orderBy: { date: 'asc' } })
    res.json(events)
})

eventsRouter.get('/:id', publicLimiter, async (req, res) => {
    const event = await prisma.event.findUnique({ where: { id: req.params['id'] as string } })
    if (!event) {
        res.status(404).json({ error: 'Evento não encontrado' })
        return
    }
    res.json(event)
})

eventsRouter.post('/', authMiddleware, async (req: AuthRequest, res) => {
    const { title, description, price, date, capacity } = req.body as {
        title: string
        description: string
        price: number
        date: string
        capacity: number
    }

    const event = await prisma.event.create({
        data: { title, description, price, date: new Date(date), capacity }
    })

    res.status(201).json(event)
})