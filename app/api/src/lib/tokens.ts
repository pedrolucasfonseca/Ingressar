import jwt, { type SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";

export function signAccessToken(userId: string, role: Role): string {
    const secret = process.env['JWT_SECRET']
    if (!secret) throw new Error('JWT_SECRET não definido')
    const expiresIn = (process.env['JWT_EXPIRES_IN'] ?? '15m') as NonNullable<SignOptions['expiresIn']>
    return jwt.sign({ userId, role }, secret, { expiresIn })
}

export function signRefreshToken(userId: string): string {
    const secret = process.env['JWT_REFRESH_SECRET']
    if (!secret) throw new Error('JWT_REFRESH_SECRET não definido')
    return jwt.sign({ userId }, secret, { expiresIn: '7d' })
}

export function verifyRefreshToken(token: string): { userId: string } {
    const secret = process.env['JWT_REFRESH_SECRET']
    if (!secret) throw new Error('JWT_REFRESH_SECRET não definido')
    return jwt.verify(token, secret) as { userId: string }
}