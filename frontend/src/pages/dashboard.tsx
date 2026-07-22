import { useState, useEffect, useCallback } from "react"
import { spacesApi } from "@/lib/api"
import type { Espacio } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatDate } from "@/lib/utils"

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

export default function DashboardPage() {
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchEspacios = useCallback(async () => {
    try {
      const data = await spacesApi.list()
      setEspacios(data || [])
      setLastUpdate(new Date())
      setConnected(true)
    } catch {
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEspacios()
    const interval = setInterval(fetchEspacios, 30000)
    return () => clearInterval(interval)
  }, [fetchEspacios])

  useEffect(() => {
    let eventSource: EventSource | null = null
    let reconnectTimer: ReturnType<typeof setTimeout>

    const connect = () => {
      eventSource = new EventSource(SSE_URL)
      eventSource.onopen = () => setConnected(true)
      eventSource.onmessage = () => fetchEspacios()
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
  }, [fetchEspacios])

  const disponibles = espacios.filter((e) => e.estado === "DISPONIBLE").length
  const ocupados = espacios.filter((e) => e.estado === "OCUPADO").length
  const inactivos = espacios.filter((e) => e.estado === "INACTIVO").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard de Espacios</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className={cn("h-2.5 w-2.5 rounded-full", connected ? "bg-green-500" : "bg-red-500")} />
            <span className="text-muted-foreground">{connected ? "Conectado" : "Desconectado"}</span>
          </div>
          <span className="text-sm text-muted-foreground">{espacios.length} espacios</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Disponibles</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600">{disponibles}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ocupados</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-600">{ocupados}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Inactivos</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-yellow-600">{inactivos}</p></CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {espacios.map((esp) => (
            <div
              key={esp.id}
              className={cn("rounded-lg border-2 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md", estadoStyles[esp.estado] || "")}
            >
              <p className="font-bold text-lg">{esp.codigo}</p>
              <p className="text-xs text-muted-foreground">Zona: {esp.nombreZona || "N/A"}</p>
              <p className="text-xs text-muted-foreground">Tipo: {esp.tipo}</p>
              <div className="mt-2 flex items-center justify-between">
                <Badge className={estadoBadge[esp.estado]}>{esp.estado}</Badge>
                <span className="text-[10px] text-muted-foreground">
                  {esp.id.slice(0, 8)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="text-center text-sm text-muted-foreground border-t pt-4">
        Última actualización: {formatDate(lastUpdate.toISOString())}
      </footer>
    </div>
  )
}
