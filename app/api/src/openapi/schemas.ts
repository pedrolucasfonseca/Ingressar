import 'zod-openapi'
import { z } from 'zod'

// Schemas de resposta, refletem exatamente o que cada rota devolve hoje. Servem só de fonte para o OpenAPI gerado em src/openapi/document.ts.

export const IdEmailSchema = z.object({
    id: z.string(),
    email: z.string().email(),
}).meta({ id: 'IdEmail' })

export const AccessTokenSchema = z.object({
    accessToken: z.string(),
}).meta({ id: 'AccessToken' })

export const MessageSchema = z.object({
    message: z.string(),
}).meta({ id: 'Message' })

export const SimpleErrorSchema = z.object({
    error: z.string(),
}).meta({ id: 'SimpleError' })

export const ValidationErrorSchema = z.object({
    error: z.object({
        formErrors: z.array(z.string()),
        fieldErrors: z.record(z.string(), z.array(z.string())),
    }),
}).meta({ id: 'ValidationError' })

export const EventSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    priceCents: z.number().int(),
    date: z.string().datetime(),
    location: z.string(),
    capacity: z.number().int(),
    organizerId: z.string(),
    status: z.enum(['draft', 'published', 'cancelled', 'finished']),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
}).meta({ id: 'Event' })

export const TicketSchema = z.object({
    id: z.string(),
    userId: z.string(),
    eventId: z.string(),
    status: z.enum(['pending', 'confirmed', 'cancelled']),
    qrCode: z.string().nullable(),
    createdAt: z.string().datetime(),
}).meta({ id: 'Ticket' })

export const TicketWithEventSchema = TicketSchema.extend({
    event: EventSchema,
}).meta({ id: 'TicketWithEvent' })