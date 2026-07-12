import "zod-openapi";
import { z } from "zod";

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
    bannerUrl: z.string().url().nullable(),
    organizerId: z.string(),
    status: z.enum(['draft', 'published', 'cancelled', 'finished']),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
}).meta({ id: 'Event' })

export const BannerUploadUrlSchema = z.object({
    uploadUrl: z.string().url(),
    publicUrl: z.string().url(),
}).meta({ id: 'BannerUploadUrl' })

export const PaginatedEventsSchema = z.object({
    data: z.array(EventSchema),
    pagination: z.object({
        page: z.number().int(),
        limit: z.number().int(),
        total: z.number().int(),
        totalPages: z.number().int(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
    }),
}).meta({ id: 'PaginatedEvents' })

export const EventDashboardSchema = z.object({
    ticketsSold: z.number().int(),
    revenueCents: z.number().int(),
    capacityRemaining: z.number().int(),
    confirmationRate: z.number().min(0).max(1),
    salesByDay: z.array(z.object({ date: z.string(), count: z.number().int() })),
}).meta({ id: 'EventDashboard' })

export const CheckoutResponseSchema = z.object({
    clientSecret: z.string(),
    ticketId: z.string(),
}).meta({ id: 'CheckoutResponse' })

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