const API_BASE = "http://localhost:8000"

function getAccessToken(): string | null {
  return localStorage.getItem("access_token")
}

function getRefreshToken(): string | null {
  return localStorage.getItem("refresh_token")
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access)
  localStorage.setItem("refresh_token", refresh)
}

function clearTokens() {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
}

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    })
    if (!res.ok) return false
    const data = await res.json()
    setTokens(data.access_token, data.refresh_token)
    return true
  } catch {
    return false
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok && res.status !== 401) {
    const errBody = await res.text().catch(() => "")
    let message: string
    try {
      const parsed = JSON.parse(errBody)
      message = parsed.message || parsed.error || parsed.detail || `HTTP ${res.status}`
    } catch {
      message = errBody || `Error ${res.status}`
    }
    throw new Error(message)
  }

  if (res.status === 401 && token) {
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false
        refreshPromise = null
      })
    }
    const refreshed = await refreshPromise
    if (refreshed) {
      const newToken = getAccessToken()
      headers["Authorization"] = `Bearer ${newToken}`
      res = await fetch(`${API_BASE}${path}`, { ...options, headers })
    } else {
      clearTokens()
      window.location.href = "/login"
      throw new Error("Sesión expirada")
    }
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => "")
    let message: string
    try {
      const parsed = JSON.parse(errBody)
      message = parsed.message || parsed.error || parsed.detail || `HTTP ${res.status}`
    } catch {
      message = errBody || `Error ${res.status}`
    }
    throw new Error(message)
  }

  if (res.status === 204) return undefined as T

  const text = await res.text()
  if (!text) return undefined as T

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Invalid JSON response: ${text.slice(0, 100)}`)
  }
}

// Auth API
export const authApi = {
  login: (payload: { username: string; password: string; mac?: string }) =>
    apiFetch<{ access_token: string; refresh_token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((data) => {
      setTokens(data.access_token, data.refresh_token)
      return data
    }),

  register: (payload: Record<string, unknown>) =>
    apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  refresh: () => refreshAccessToken(),

  logout: () => {
    clearTokens()
  },
}

// Users API
export const usersApi = {
  list: () => apiFetch<User[]>("/api/usuarios"),
  get: (id: string) => apiFetch<User>(`/api/usuarios/${id}`),
  create: (data: Partial<User>) =>
    apiFetch<User>("/api/usuarios", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<User>) =>
    apiFetch<User>(`/api/usuarios/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<void>(`/api/usuarios/${id}`, { method: "DELETE" }),
  hardDelete: (id: string) =>
    apiFetch<void>(`/api/usuarios/${id}/hard`, { method: "DELETE" }),
}

// Persons API
export const personsApi = {
  list: () => apiFetch<Person[]>("/api/persons"),
  get: (id: string) => apiFetch<Person>(`/api/persons/${id}`),
  getMe: () => apiFetch<Person>("/api/persons/me"),
  updateMe: (data: Partial<Person>) =>
    apiFetch<Person>("/api/persons/me", { method: "PATCH", body: JSON.stringify(data) }),
  create: (data: Partial<Person & { password?: string }>) =>
    apiFetch<Person>("/api/persons", { method: "POST", body: JSON.stringify(data) }),
  createOnly: (data: Partial<Person>) =>
    apiFetch<Person>("/api/persons/only", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Person>) =>
    apiFetch<Person>(`/api/persons/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<void>(`/api/persons/${id}`, { method: "DELETE" }),
  hardDelete: (id: string) =>
    apiFetch<void>(`/api/persons/${id}/hard`, { method: "DELETE" }),
}

// Roles API
export const rolesApi = {
  list: () => apiFetch<Role[]>("/api/roles"),
  get: (id: string) => apiFetch<Role>(`/api/roles/${id}`),
  create: (data: Partial<Role>) =>
    apiFetch<Role>("/api/roles", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Role>) =>
    apiFetch<Role>(`/api/roles/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<void>(`/api/roles/${id}`, { method: "DELETE" }),
  hardDelete: (id: string) =>
    apiFetch<void>(`/api/roles/${id}/hard`, { method: "DELETE" }),
}

// User-Role API
export const userRoleApi = {
  assign: (userId: string, roleId: string) =>
    apiFetch("/api/user-role", {
      method: "POST",
      body: JSON.stringify({ idUser: userId, idRole: roleId }),
    }),
  remove: (userId: string, roleId: string) =>
    apiFetch<void>(`/api/user-role/${userId}/${roleId}`, { method: "DELETE" }),
  removeHard: (userId: string, roleId: string) =>
    apiFetch<void>(`/api/user-role/${userId}/${roleId}/hard`, { method: "DELETE" }),
  getUserRoles: (userId: string) =>
    apiFetch<UserRole[]>(`/api/user-role/user/${userId}`),
  getRoleUsers: (roleId: string) =>
    apiFetch<UserRole[]>(`/api/user-role/role/${roleId}`),
}

// Vehicles API
export const vehiclesApi = {
  list: (tipo?: string) =>
    apiFetch<Vehicle[]>(`/api/vehiculos${tipo ? `?tipo=${tipo}` : ""}`),
  get: (id: string) => apiFetch<Vehicle>(`/api/vehiculos/${id}`),
  create: (data: Record<string, unknown>) =>
    apiFetch<Vehicle>("/api/vehiculos", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<Vehicle>(`/api/vehiculos/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<void>(`/api/vehiculos/${id}`, { method: "DELETE" }),
}

// Zones API
export const zonesApi = {
  list: () => apiFetch<Zona[]>("/api/zonas"),
  get: (id: string) => apiFetch<Zona>(`/api/zonas/${id}`),
  create: (data: ZonaPayload) =>
    apiFetch<Zona>("/api/zonas", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: ZonaPayload) =>
    apiFetch<Zona>(`/api/zonas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  toggleEstado: (id: string) =>
    apiFetch<Zona>(`/api/zonas/${id}/estado`, { method: "PATCH" }),
  delete: (id: string) =>
    apiFetch<void>(`/api/zonas/${id}`, { method: "DELETE" }),
}

// Spaces API
export const spacesApi = {
  list: () => apiFetch<Espacio[]>("/api/espacios"),
  get: (id: string) => apiFetch<Espacio>(`/api/espacios/${id}`),
  create: (data: EspacioPayload) =>
    apiFetch<Espacio>("/api/espacios", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: EspacioPayload) =>
    apiFetch<Espacio>(`/api/espacios/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<void>(`/api/espacios/${id}`, { method: "DELETE" }),
  cambiarEstado: (id: string, estado: string) =>
    apiFetch<Espacio>(`/api/espacios/${id}/estado?estado=${estado}`, { method: "PATCH" }),
  findByEstado: (estado: string) =>
    apiFetch<Espacio[]>(`/api/espacios/estado/${estado}`),
  findByZonaYEstado: (idZona: string, estado: string) =>
    apiFetch<Espacio[]>(`/api/espacios/zona/${idZona}/estado/${estado}`),
}

// Asignaciones API
export const asignacionesApi = {
  list: () => apiFetch<Asignacion[]>("/api/asignaciones"),
  create: (data: { userId: string; vehicleId: string }) =>
    apiFetch<Asignacion>("/api/asignaciones", { method: "POST", body: JSON.stringify(data) }),
  getByOwner: (userId: string) =>
    apiFetch<Asignacion[]>(`/api/asignaciones/propietario/${userId}`),
  get: (userId: string, vehicleId: string) =>
    apiFetch<Asignacion>(`/api/asignaciones/${userId}/${vehicleId}`),
  delete: (userId: string, vehicleId: string) =>
    apiFetch<void>(`/api/asignaciones/${userId}/${vehicleId}`, { method: "DELETE" }),
}

// Tickets API
export const ticketsApi = {
  list: () => apiFetch<Ticket[]>("/api/tickets"),
  get: (id: string) => apiFetch<Ticket>(`/api/tickets/${id}`),
  create: (data: CreateTicketPayload) =>
    apiFetch<Ticket>("/api/tickets", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Ticket>) =>
    apiFetch<Ticket>(`/api/tickets/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  cobrar: (id: string, fechaHoraSalida?: string) =>
    apiFetch<Ticket>(`/api/tickets/${id}/cobrar${fechaHoraSalida ? `?fechaHoraSalida=${fechaHoraSalida}` : ""}`, { method: "POST" }),
  anular: (id: string) =>
    apiFetch<Ticket>(`/api/tickets/${id}/anular`, { method: "POST" }),
  delete: (id: string) =>
    apiFetch<void>(`/api/tickets/${id}`, { method: "DELETE" }),
  byVehicle: (idVehiculo: string) =>
    apiFetch<Ticket[]>(`/api/tickets/vehiculo/${idVehiculo}`),
}

// Audit API
export const auditApi = {
  list: () => apiFetch<AuditEvent[]>("/api/audit"),
  get: (id: string) => apiFetch<AuditEvent>(`/api/audit/${id}`),
}

// Trazabilidad API
export const trazabilidadApi = {
  list: () => apiFetch("/api/trazabilidad"),
  byAsignacion: (userId: string, vehicleId: string) =>
    apiFetch(`/api/trazabilidad/asignacion/${userId}/${vehicleId}`),
}

import type {
  User, Role, UserRole, Person, Vehicle,
  Zona, ZonaPayload, Espacio, EspacioPayload,
  Asignacion, Ticket, CreateTicketPayload, AuditEvent
} from "@/types"
