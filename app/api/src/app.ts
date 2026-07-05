import "dotenv/config";
import express from "express";
import { authRouter } from "./routes/auth";
import { eventsRouter } from "./routes/events";
import { ticketsRouter } from "./routes/tickets";
import cookieParser from "cookie-parser";

export const app = express()

app.use(express.json())
app.use(cookieParser())

app.get('/status', (_req, res) => {
    res.json({ status: 'ok' })
})

app.use('/auth', authRouter)
app.use('/events', eventsRouter)
app.use('/tickets', ticketsRouter)