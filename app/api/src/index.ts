import "dotenv/config";
import express from 'express'
import { authRouter } from './routes/auth'
import { eventsRouter } from './routes/events'
import { ticketsRouter } from './routes/tickets'

const app = express()
const PORT = process.env['PORT'] ?? 3001

app.use(express.json())

app.use('/auth', authRouter)
app.use('/events', eventsRouter)
app.use('/tickets', ticketsRouter)

app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`)
})