import type { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { signAccessToken } from "../src/lib/tokens";

export async function createUser(email: string, role: 'organizer' | 'buyer' = 'buyer') {
    const user = await prisma.user.create({
        data: { email, name: role === 'organizer' ? 'Organizer' : 'User', passwordHash: 'x', role },
    })
    return { user, token: signAccessToken(user.id, role) }
}

export async function createOrganizer(email: string) {
    return createUser(email, 'organizer')
}

export function makeEventData(
    organizerId: string,
    overrides: Partial<Prisma.EventUncheckedCreateInput> = {},
): Prisma.EventUncheckedCreateInput {
    return {
        title: 'Show de teste',
        description: 'Desc',
        priceCents: 1000,
        date: new Date('2030-01-01T20:00:00Z'),
        location: 'SP',
        capacity: 10,
        organizerId,
        status: 'published',
        ...overrides,
    }
}
