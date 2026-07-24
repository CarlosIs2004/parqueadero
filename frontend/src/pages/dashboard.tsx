import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { spacesApi, zonesApi } from "@/lib/api"
import type { Espacio, Zona } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatDate } from "@/lib/utils"
import { useAuth } from "@/providers/auth-provider"
import { LogIn, Car, Bike, Bus, Wifi, WifiOff } from "lucide-react"

const SSE_URL = "http://localhost:8000/api/sse/espacios"

const estadoStyles: Record<string, string> = {
  DISPONIBLE: "border-green-400 bg-green-50 dark:bg-green-950",
  OCUPADO: "border-red-400 bg-red-50 dark:bg-red-950",
  INACTIVO: "border-yellow-400 bg-yellow-50 dark:bg-yellow-950",
}

const estadoBadge: Record<string, string> = {
  DISPONIBLE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  OCUPADO: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  INACTIVO: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
}

const tipoIcon: Record<string, typeof Car> = {
  AUTO: Car,
  MOTO: Bike,
  BUSETA: Bus,
}

const zoneTheme: Record<string, { border: string; header: string; text: string; label: string }> = {
  VIP: {
    border: "border-amber-300 dark:border-amber-700",
    header: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-300",
    label: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  },
  REGULAR: {
    border: "border-sky-300 dark:border-sky-700",
    header: "bg-sky-50 dark:bg-sky-950",
    text: "text-sky-700 dark:text-sky-300",
    label: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200",
  },
}

function groupByZone(espacios: Espacio[]): Record<string, Espacio[]> {
  const groups: Record<string, Espacio[]> = {}
  for (const esp of espacios) {
    const key = esp.nombreZona || "Sin zona"
    if (!groups[key]) groups[key] = []
    groups[key].push(esp)
  }
  return groups
}

export default function DashboardPage() {
  const { isAuthenticated, profile } = useAuth()
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [zonasMap, setZonasMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchData = useCallback(async () => {
    try {
      const [data, zonas] = await Promise.all([spacesApi.list(), zonesApi.list()])
      setEspacios(data || [])
      const map: Record<string, string> = {}
      for (const z of (zonas as unknown as { value?: Zona[] })?.value ?? (zonas as Zona[])) {
        map[z.idZona] = z.tipo
      }
      setZonasMap(map)
      setLastUpdate(new Date())
      setConnected(true)
    } catch {
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
    let eventSource: EventSource | null = null
    let reconnectTimer: ReturnType<typeof setTimeout>

    const connect = () => {
      eventSource = new EventSource(SSE_URL)
      eventSource.onopen = () => setConnected(true)
      eventSource.onmessage = () => fetchData()
      eventSource.onerror = () => {
        setConnected(false)
        eventSource?.close()
        reconnectTimer = setTimeout(connect, 5000)
      }
    }
    connect()
    return () => {
      eventSource?.close()
      clearTimeout(reconnectTimer)
    }
  }, [fetchData])

  const disponibles = espacios.filter((e) => e.estado === "DISPONIBLE").length
  const ocupados = espacios.filter((e) => e.estado === "OCUPADO").length
  const inactivos = espacios.filter((e) => e.estado === "INACTIVO").length
  const grouped = groupByZone(espacios)

  const zonaTipoMap: Record<string, string> = {}
  for (const esp of espacios) {
    if (esp.nombreZona && !zonaTipoMap[esp.nombreZona]) {
      zonaTipoMap[esp.nombreZona] = zonasMap[esp.idZona] || "REGULAR"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              P
            </div>
            <h1 className="text-xl font-bold tracking-tight">Parqueadero</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {connected ? (
                <Wifi className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-red-500" />
              )}
              {connected ? "En vivo" : "Desconectado"}
            </div>
            {isAuthenticated ? (
              <span className="text-sm text-muted-foreground">
                {profile?.firstName || "Usuario"}
              </span>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Disponibles</CardTitle>
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{disponibles}</p>
              <p className="text-xs text-muted-foreground mt-1">Espacios libres</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Ocupados</CardTitle>
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{ocupados}</p>
              <p className="text-xs text-muted-foreground mt-1">Espacios en uso</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Inactivos</CardTitle>
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{inactivos}</p>
              <p className="text-xs text-muted-foreground mt-1">Fuera de servicio</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border rounded-xl p-4 space-y-3">
                <Skeleton className="h-5 w-40 mx-auto" />
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }).map((_, j) => (
                    <Skeleton key={j} className="h-16 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(grouped).map(([zona, espaciosZona]) => {
              const disp = espaciosZona.filter((e) => e.estado === "DISPONIBLE").length
              const total = espaciosZona.length
              const tipo = zonaTipoMap[zona] || "REGULAR"
              const theme = zoneTheme[tipo] || zoneTheme.REGULAR
              return (
                <div key={zona} className={cn("border-2 rounded-xl overflow-hidden", theme.border)}>
                  <div className={cn("border-b px-4 py-2.5 text-center", theme.header)}>
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="font-semibold text-sm uppercase tracking-wider">{zona}</h2>
                      <Badge className={cn("text-[10px] px-2 py-0 font-semibold", theme.label)}>{tipo}</Badge>
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      disp === 0 ? "text-red-500" : "text-green-600"
                    )}>
                      {disp}/{total} disponibles
                    </span>
                  </div>
                  <div className="p-2.5 grid grid-cols-5 gap-1.5">
                    {espaciosZona.map((esp) => {
                      const Icon = tipoIcon[esp.tipo] || Car
                      return (
                        <div
                          key={esp.id}
                          className={cn(
                            "rounded-lg border-2 p-1.5 flex flex-col items-center justify-center text-center transition-all hover:-translate-y-0.5 hover:shadow-sm",
                            estadoStyles[esp.estado] || ""
                          )}
                        >
                          <Icon className="h-5 w-5 text-muted-foreground mb-0.5" />
                          <p className="font-bold text-[10px] leading-tight truncate w-full">{esp.codigo}</p>
                          <Badge className={cn("text-[9px] px-1.5 py-0 mt-0.5 leading-3", estadoBadge[esp.estado])}>
                            {esp.estado === "DISPONIBLE" ? "DISPONIBLE" : esp.estado === "OCUPADO" ? "OCUPADO" : "INACTIVO"}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <footer className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
          <span>{espacios.length} espacios en total</span>
          <span>Última actualización: {formatDate(lastUpdate.toISOString())}</span>
        </footer>
      </main>
    </div>
  )
}
