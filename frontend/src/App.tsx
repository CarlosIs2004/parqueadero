import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/providers/auth-provider"
import AppLayout from "@/layouts/app-layout"
import LoginPage from "@/pages/login"
import RegisterPage from "@/pages/register"
import DashboardPage from "@/pages/dashboard"
import UsersPage from "@/pages/users"
import RolesPage from "@/pages/roles"
import PersonsPage from "@/pages/persons"
import VehiclesPage from "@/pages/vehicles"
import ZonesPage from "@/pages/zones"
import SpacesPage from "@/pages/spaces"
import AssignmentsPage from "@/pages/assignments"
import TicketsPage from "@/pages/tickets"
import AuditPage from "@/pages/audit"
import type { ReactNode } from "react"

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="personas" element={<PersonsPage />} />
            <Route path="vehiculos" element={<VehiclesPage />} />
            <Route path="zonas" element={<ZonesPage />} />
            <Route path="espacios" element={<SpacesPage />} />
            <Route path="asignaciones" element={<AssignmentsPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="audit" element={<AuditPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
