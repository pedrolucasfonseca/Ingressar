import { Router } from "express";
import { z } from "zod";
import type { Event, EventStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole, requireEventOwner } from "../middleware/auth";
import type { AuthRequest } from "../middleware/auth";
import { publicLimiter, authLimiter, ticketLimiter } from "../middleware/rateLimiter";
import { isValidStatusTransition } from "../lib/eventStatus";
import { createCheckoutSession, CheckoutError } from "../lib/checkout";

export const eventsRouter = Router()

export const CreateEventSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(1),
    price: z.number().int().nonnegative(),
    date: z.string().datetime(),
    capacity: z.number().int().positive(),
    location: z.string().min(3).max(200),
})

export const UpdateEventSchema = z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().min(1).optional(),
    location: z.string().min(3).max(200).optional(),
    status: z.enum(['draft', 'published', 'cancelled', 'finished']).optional(),
})

const SORT_FIELDS = { date: 'date', price: 'priceCents', createdAt: 'createdAt' } as const

export const ListEventsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sort: z.enum(['date', 'price', 'createdAt']).default('date'),
    order: z.enum(['asc', 'desc']).default('asc'),
})

eventsRouter.get('/', publicLimiter, async (req, res) => {
    const parsed = ListEventsQuerySchema.safeParse(req.query)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }
    const { page, limit, sort, order } = parsed.data
    const where = { status: 'published' as const }

    const [data, total] = await Promise.all([
        prisma.event.findMany({
            where,
            orderBy: { [SORT_FIELDS[sort]]: order },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.event.count({ where }),
    ])
    const totalPages = Math.ceil(total / limit)

    res.json({
        data,
        pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    })
})

eventsRouter.get('/:id', publicLimiter, async (req, res) => {
    const event = await prisma.event.findUnique({ where: { id: req.params['id'] as string } })
    if (!event) {
        res.status(404).json({ error: 'Evento não encontrado' })
        return
    }
    res.json(event)
})

eventsRouter.post('/', authLimiter, authMiddleware, requireRole('organizer'), async (req: AuthRequest, res) => {
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

eventsRouter.patch('/:id', authLimiter, authMiddleware, requireRole('organizer'), requireEventOwner, async (req: AuthRequest, res) => {
    const parsed = UpdateEventSchema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }

    const { title, description, location, status } = parsed.data
    if (status !== undefined && !isValidStatusTransition(req.event?.status as EventStatus, status)) {
        res.status(400).json({ error: `Transição de status inválida: ${req.event?.status} → ${status}` })
        return
    }

    const event = await prisma.event.update({
        where: { id: req.event?.id as string },
        data: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(location !== undefined && { location }),
            ...(status !== undefined && { status }),
        },
    })

    res.json(event)
})

eventsRouter.get('/:id/dashboard', authLimiter, authMiddleware, requireRole('organizer'), requireEventOwner, async (req: AuthRequest, res) => {
    const event = req.event as Event

    const tickets = await prisma.ticket.findMany({
        where: { eventId: event.id, status: { not: 'cancelled' } },
        select: { createdAt: true },
    })

    const ticketsSold = tickets.length
    // Sem integração de pagamento ainda (v0.5.0/v0.6.0): cada ticket não-cancelado
    // vale o preço do evento, não há valor efetivamente cobrado a somar da Payment.
    const revenueCents = ticketsSold * event.priceCents
    const capacityRemaining = event.capacity - ticketsSold

    const countByDay = new Map<string, number>()
    for (const ticket of tickets) {
        const day = ticket.createdAt.toISOString().slice(0, 10)
        countByDay.set(day, (countByDay.get(day) ?? 0) + 1)
    }
    const salesByDay = [...countByDay.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }))

    res.json({ ticketsSold, revenueCents, capacityRemaining, salesByDay })
})

eventsRouter.post('/:id/checkout', ticketLimiter, authMiddleware, requireRole('buyer'), async (req: AuthRequest, res) => {
    try {
        const result = await createCheckoutSession(req.params['id'] as string, req.user?.id as string)
        res.status(201).json(result)
    } catch (err) {
        if (err instanceof CheckoutError) {
            res.status(err.status).json({ error: err.message })
            return
        }
        throw err
    }
})