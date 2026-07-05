import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole, requireEventOwner } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import { publicLimiter } from "../middleware/rateLimiter";

export const eventsRouter = Router()

const CreateEventSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(1),
    price: z.number().int().nonnegative(),
    date: z.string().datetime(),
    capacity: z.number().int().positive(),
    location: z.string().min(3).max(200),
})

// Stub mínimo para testar requireEventOwner — v0.4.0 substitui por CRUD
// completo com transições de status (draft → published → cancelled).
const UpdateEventSchema = z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().min(1).optional(),
    location: z.string().min(3).max(200).optional(),
})

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

eventsRouter.post('/', authMiddleware, requireRole('organizer'), async (req: AuthRequest, res) => {
    const parsed = CreateEventSchema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }
    const { title, description, price, date, capacity, location } = parsed.data

    const event = await prisma.event.create({
        data: { title, description, priceCents: price, location, date: new Date(date), capacity, organizerId: req.user?.id as string }
    })

    res.status(201).json(event)
})

eventsRouter.patch('/:id', authMiddleware, requireRole('organizer'), requireEventOwner, async (req: AuthRequest, res) => {
    const parsed = UpdateEventSchema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }

    const { title, description, location } = parsed.data
    const event = await prisma.event.update({
        where: { id: req.event?.id as string },
        data: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(location !== undefined && { location }),
        },
    })

    res.json(event)
})