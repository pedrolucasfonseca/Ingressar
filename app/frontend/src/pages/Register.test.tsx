import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { Register } from './Register'

const registerMock = vi.fn()

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ login: vi.fn(), register: registerMock, logout: vi.fn(), user: null, loading: false }),
}))

beforeEach(() => {
  registerMock.mockReset()
})

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>,
  )
}

describe('Register', () => {
  it('valida senha com menos de 6 caracteres sem chamar a API', async () => {
    renderRegister()

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Fulano' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'fulano@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/pelo menos 6 caracteres/i))
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('envia o role selecionado (organizer) ao criar conta', async () => {
    registerMock.mockResolvedValue(undefined)
    renderRegister()

    fireEvent.click(screen.getByRole('button', { name: 'Organizar eventos' }))
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Organizador' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'org@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha123' } })
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() =>
      expect(registerMock).toHaveBeenCalledWith('org@test.com', 'senha123', 'Organizador', 'organizer'),
    )
  })

  it('não tem violações básicas de acessibilidade', async () => {
    const { container } = renderRegister()
    expect(await axe(container)).toHaveNoViolations()
  })
})
