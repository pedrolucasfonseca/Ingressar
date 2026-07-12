import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { EventCard } from './EventCard'
import type { Event } from '../types/event'

const event: Event = {
  id: 'ev-1',
  title: 'Show de teste',
  description: 'Uma noite de testes',
  priceCents: 5000,
  date: '2030-01-01T20:00:00.000Z',
  location: 'São Paulo, SP',
  capacity: 100,
  bannerUrl: null,
  organizerId: 'org-1',
  status: 'published',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderCard() {
  return render(
    <MemoryRouter>
      <EventCard event={event} />
    </MemoryRouter>,
  )
}

describe('EventCard', () => {
  it('renderiza título, data e preço do evento', () => {
    renderCard()

    expect(screen.getByText('Show de teste')).toBeInTheDocument()
    expect(screen.getByText('R$ 50,00')).toBeInTheDocument()
    expect(screen.getByText(/são paulo, sp/i)).toBeInTheDocument()
  })

  it('não tem violações básicas de acessibilidade', async () => {
    const { container } = renderCard()
    expect(await axe(container)).toHaveNoViolations()
  })
})
