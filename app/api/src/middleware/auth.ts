import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: string
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
        const payload = jwt.verify(token, secret) as { userId: string }
        req.userId = payload.userId
        next()
    } catch {
        res.status(401).json({ error: 'Token expirado ou inválido' })
    }
}
