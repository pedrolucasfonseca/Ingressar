import "dotenv/config";
import { ZodError } from "zod";
import { parseEnv } from "./lib/env";
import { app } from "./app";

// Falha alto e com mensagem clara aqui, antes de aceitar qualquer request.
// Assim evita quebrar depois, na primeira vez que algo precisar da variável
// ausente (ver docs/roadmap.md v0.4.0).
function loadEnv() {
    try {
        return parseEnv(process.env)
    } catch (err) {
        console.error('Variáveis de ambiente inválidas ou ausentes:')
        console.error(err instanceof ZodError ? err.flatten().fieldErrors : err)
        return process.exit(1)
    }
}

const env = loadEnv()

app.listen(env.PORT, () => {
    console.log(`API rodando na porta ${env.PORT}`)
})

// Estado do processo pode estar corrompido depois de uma exceção não tratada.
// Loga e encerra em vez de tentar continuar rodando, deixando o orquestrador
// reiniciar o processo.
process.on('uncaughtException', (err) => {
    console.error('uncaughtException', err)
    process.exit(1)
})

process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection', reason)
    process.exit(1)
})