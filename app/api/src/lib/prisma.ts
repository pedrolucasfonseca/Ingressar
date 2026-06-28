import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env['DATABASE_URL']
if (!url) throw new Error('DATABASE_URL não definida')

// PrismaPg usa o driver nativo do pg ao invés do query engine padrão do Prisma,
// necessário para conexões diretas com PostgreSQL sem camada extra de abstração.
const adapter = new PrismaPg({ connectionString: url })
export const prisma = new PrismaClient({ adapter })