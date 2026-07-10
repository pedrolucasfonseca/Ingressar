import type { EventStatus } from "@prisma/client";

const VALID_TRANSITIONS: ReadonlySet<`${EventStatus}->${EventStatus}`> = new Set([
    'draft->published',
    'draft->cancelled',
    'published->cancelled',
])

export function isValidStatusTransition(from: EventStatus, to: EventStatus): boolean {
    return VALID_TRANSITIONS.has(`${from}->${to}`)
}