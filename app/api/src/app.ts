import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { eventsRouter } from "./routes/events";
import { ticketsRouter } from "./routes/tickets";
import { errorHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";

export const app = express()

// credentials: true, obrigatório pro cookie httpOnly do refresh token ser enviado
// cross-origin (frontend em outra porta/domínio do que a API).
app.use(cors({ origin: process.env['FRONTEND_URL'] ?? 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/status', (_req, res) => {
    res.json({ status: 'ok' })
})

app.use('/auth', authRouter)
app.use('/events', eventsRouter)
app.use('/tickets', ticketsRouter)

// Rede de segurança pra qualquer erro que as rotas não tratam explicitamente
// (AppError de negócio, erro do Prisma, bug inesperado). Express 5 encaminha
// rejeições de handlers async pra aqui automaticamente. Não precisa de
// next(err) manual nas rotas.
app.use(errorHandler)