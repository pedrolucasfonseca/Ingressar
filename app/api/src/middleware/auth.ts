import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { Event } from "@prisma/client";
import { prisma } from "../lib/prisma";

export type Role = 'organizer' | 'buyer'

export interface AuthRequest extends Request {
    user?: { id: string; role: Role }
    event?: Event
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
    const header = req.headers['authorization']
    if (!header) {
        res.status(401).json({ error: 'Token não fornecido' })
        return
    }

    const token = header.split(' ')[1]
    if (!token) {
        res.status(401).json({ error: 'Token inválido' })
        return
    }

    const secret = process.env['JWT_SECRET']
    // Lança 500 em vez de retornar 401: ausência do secret é erro de configuração,
    // não de autenticação — deve falhar alto para ser detectado imediatamente.
    if (!secret) throw new Error('JWT_SECRET não definido')

    try {
        const payload = jwt.verify(token, secret) as { userId: string; role: Role }
        req.user = { id: payload.userId, role: payload.role }
        next()
    } catch {
        res.status(401).json({ error: 'Token expirado ou inválido' })
    }
}

export const requireRole = (role: Role) => (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== role) {
        res.status(403).json({ error: 'Forbidden' })
        return
    }
    next()
}

export const requireEventOwner = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const event = await prisma.event.findUnique({ where: { id: req.params['id'] as string } })
    if (!event) {
        res.status(404).json({ error: 'Evento não encontrado' })
        return
    }
    if (event.organizerId !== req.user?.id) {
        res.status(403).json({ error: 'Forbidden' })
        return
    }
    req.event = event
    next()
}
