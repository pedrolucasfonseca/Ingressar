import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleRoute } from './components/RoleRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Landing } from './pages/Landing'
import { EventDetail } from './pages/EventDetail'
import { Checkout } from './pages/Checkout'
import { TicketList } from './pages/TicketList'
import { TicketDetail } from './pages/TicketDetail'
import { OrganizerEvents } from './pages/OrganizerEvents'
import { OrganizerForm } from './pages/OrganizerForm'
import { OrganizerDashboard } from './pages/OrganizerDashboard'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route
            path="/checkout/:eventId"
            element={
              <ProtectedRoute>
                <ErrorBoundary fallback={<p role="alert" className="mx-auto max-w-md px-4 py-16">Erro no checkout. Tente novamente.</p>}>
                  <Checkout />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route path="/tickets" element={<ProtectedRoute><TicketList /></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />

          <Route path="/organizer/events" element={<RoleRoute role="organizer"><OrganizerEvents /></RoleRoute>} />
          <Route path="/organizer/events/new" element={<RoleRoute role="organizer"><OrganizerForm /></RoleRoute>} />
          <Route path="/organizer/events/:id/edit" element={<RoleRoute role="organizer"><OrganizerForm /></RoleRoute>} />
          <Route path="/organizer/events/:id" element={<RoleRoute role="organizer"><OrganizerDashboard /></RoleRoute>} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
