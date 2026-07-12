import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'

const useAuthMock = vi.fn()
vi.mock('../hooks/useAuth', () => ({ useAuth: () => useAuthMock() }))

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/protegido']}>
      <Routes>
        <Route
          path="/protegido"
          element={
            <ProtectedRoute>
              <p>Conteúdo protegido</p>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<p>Página de login</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('redireciona para /login sem usuário autenticado', () => {
    useAuthMock.mockReturnValue({ user: null, loading: false })
    renderProtected()

    expect(screen.getByText('Página de login')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument()
  })

  it('renderiza o conteúdo protegido com usuário autenticado', () => {
    useAuthMock.mockReturnValue({ user: { id: 'u1', role: 'buyer' }, loading: false })
    renderProtected()

    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
  })

  it('não renderiza nada enquanto a sessão ainda está carregando', () => {
    useAuthMock.mockReturnValue({ user: null, loading: true })
    renderProtected()

    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument()
    expect(screen.queryByText('Página de login')).not.toBeInTheDocument()
  })
})
