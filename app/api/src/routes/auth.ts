import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authLimiter } from "../middleware/rateLimiter";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/tokens";
import { authMiddleware } from "../middleware/auth";
import crypto from "node:crypto";
import { sendPasswordResetEmail } from "../lib/email";

export const authRouter = Router()

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2).max(100),
    role: z.enum(['organizer', 'buyer']).default('buyer'),
})

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export const ForgotPasswordSchema = z.object({
    email: z.string().email(),
})

export const ResetPasswordSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(6),
})

// sameSite: 'strict' impede o navegador de enviar esse cookie em requisições cross-site
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict' as const,
    path: '/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

authRouter.post('/register', authLimiter, async (req, res) => {
    const parsed = RegisterSchema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }
    const { email, password, name, role } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        res.status(409).json({ error: 'Email já cadastrado' })
        return
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, name, passwordHash: hashed, role } })

    res.status(201).json({ id: user.id, email: user.email })
})

authRouter.post('/login', authLimiter, async (req, res) => {
    const parsed = LoginSchema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }
    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        // Mesma mensagem de erro para email inexistente e senha errada.
        // Evita enumeração de usuários cadastrados.
        res.status(401).json({ error: 'Credenciais inválidas' })
        return
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
        res.status(401).json({ error: 'Credenciais inválidas' })
        return
    }

    const accessToken = signAccessToken(user.id, user.role)
    const refreshToken = signRefreshToken(user.id)

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
    res.json({ accessToken })
})

authRouter.post('/refresh', authLimiter, async (req, res) => {
    const token = req.cookies['refreshToken']
    if (!token) {
        res.status(401).json({ error: 'Refresh token não fornecido' })
        return
    }

    try {
        const payload = verifyRefreshToken(token)
        const user = await prisma.user.findUnique({ where: { id: payload.userId } })
        if (!user) {
            res.status(401).json({ error: 'Usuário não encontrado' })
            return
        }

        const accessToken = signAccessToken(user.id, user.role)
        res.json({ accessToken })
    } catch {
        res.status(401).json({ error: 'Refresh token inválido ou expirado' })
    }
})

authRouter.post('/logout', authLimiter, authMiddleware, (_req, res) => {
    res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS)
    res.status(204).send()
})

authRouter.post('/forgot-password', authLimiter, async (req, res) => {
    const parsed = ForgotPasswordSchema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }
    const { email } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
        const token = crypto.randomBytes(32).toString('hex')
        await prisma.passwordResetToken.create({
            data: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
        })
        await sendPasswordResetEmail(user.email, token)
    }

    // Sempre 200, exista ou não o email, evita enumeração de usuários cadastrados.
    res.status(200).json({ message: 'Se o email existir, um link de redefinição foi enviado.' })
})

authRouter.post('/reset-password', authLimiter, async (req, res) => {
    const parsed = ResetPasswordSchema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }
    const { token, password } = parsed.data

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
        res.status(400).json({ error: 'Token inválido ou expirado' })
        return
    }

    const hashed = await bcrypt.hash(password, 10)
    await prisma.$transaction([
        prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash: hashed } }),
        prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ])

    res.status(200).json({ message: 'Senha redefinida com sucesso' })
})
