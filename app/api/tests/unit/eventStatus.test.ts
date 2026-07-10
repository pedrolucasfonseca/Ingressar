import type { EventStatus } from "@prisma/client";
import { isValidStatusTransition } from "../../src/lib/eventStatus";

const ALL_STATUSES: EventStatus[] = ['draft', 'published', 'cancelled', 'finished']
const VALID_PAIRS = new Set(['draft->published', 'draft->cancelled', 'published->cancelled'])

describe('isValidStatusTransition', () => {
    for (const from of ALL_STATUSES) {
        for (const to of ALL_STATUSES) {
            const expected = VALID_PAIRS.has(`${from}->${to}`)
            it(`${from} -> ${to} é ${expected ? 'válida' : 'inválida'}`, () =>
                expect(isValidStatusTransition(from, to)).toBe(expected)
            )
        }
    }
})