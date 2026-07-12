import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { Login } from './Login'

const loginMock = vi.fn()

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ login: loginMock, register: vi.fn(), logout: vi.fn(), user: null, loading: false }),
}))

beforeEach(() => {
  loginMock.mockReset()
})

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  )
}

describe('Login', () => {
  it('faz login com email e senha preenchidos', async () => {
    loginMock.mockResolvedValue(undefined)
    renderLogin()

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'buyer@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha123' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith('buyer@test.com', 'senha123'))
  })

  it('exibe erro com credenciais inválidas', async () => {
    loginMock.mockRejectedValue(new Error('401'))
    renderLogin()

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'buyer@test.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'errada' } })
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })

  it('não tem violações básicas de acessibilidade', async () => {
    const { container } = renderLogin()
    expect(await axe(container)).toHaveNoViolations()
  })
})
