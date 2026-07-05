import { execSync } from 'node:child_process'
import { prisma } from '../../src/lib/prisma'

beforeAll(() => {
    execSync('npx prisma migrate deploy', { env: process.env })
})

afterEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "Payment", "Ticket", "Event", "PasswordResetToken", "User" CASCADE`
})

afterAll(async () => {
    await prisma.$disconnect()
})