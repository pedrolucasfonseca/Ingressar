import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export const authRouter = Router()

authRouter.post('/register', async (req, res) => {
    const { email, password } = req.body as { email: string; password: string }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        res.status(409).json({ error: 'Email já cadastrado' })
        return
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, password: hashed } })

    res.status(201).json({ id: user.id, email: user.email })
})

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body as { email: string; password: string }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        // Mesma mensagem de erro para email inexistente e senha errada —
        // evita enumeração de usuários cadastrados.
        res.status(401).json({ error: 'Credenciais inválidas' })
        return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
        res.status(401).json({ error: 'Credenciais inválidas' })
        return
    }

    const secret = process.env['JWT_SECRET']
    if (!secret) throw new Error('JWT_SECRET não definida')

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' })
    res.json({ token })
})