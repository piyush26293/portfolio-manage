import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { LoginPage } from '../pages/LoginPage'
import { PortfolioDashboardPage } from '../pages/PortfolioDashboardPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <PortfolioDashboardPage />
      </ProtectedRoute>
    ),
  },
])
