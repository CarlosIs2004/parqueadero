import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authApi, personsApi } from "@/lib/api"
import type { Person } from "@/types"

interface AuthUser {
  access_token: string
  refresh_token: string
}

interface AuthContextType {
  user: AuthUser | null
  profile: Person | null
  isAuthenticated: boolean
  login: (username: string, password: string, mac?: string) => Promise<void>
  register: (data: Record<string, unknown>) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Person | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      setUser({ access_token: token, refresh_token: localStorage.getItem("refresh_token") || "" })
      personsApi.getMe().then(setProfile).catch(() => {})
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string, mac?: string) => {
    const tokens = await authApi.login({ username, password, mac })
    setUser(tokens)
    try {
      const p = await personsApi.getMe()
      setProfile(p)
    } catch {}
  }

  const register = async (data: Record<string, unknown>) => {
    await authApi.register(data)
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, isAuthenticated: !!user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
