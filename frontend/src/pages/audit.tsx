import { useState, useEffect } from "react"
import { auditApi } from "@/lib/api"
import type { AuditEvent } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const data = await auditApi.list()
        setEvents(data || [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = events.filter((e) =>
    !search || e.accion.toLowerCase().includes(search.toLowerCase()) ||
    e.entidad.toLowerCase().includes(search.toLowerCase()) ||
    e.usuario?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Auditoría</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sin eventos</TableCell></TableRow>
              ) : filtered.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell><Badge variant="outline">{ev.accion}</Badge></TableCell>
                  <TableCell className="font-medium">{ev.entidad}</TableCell>
                  <TableCell>{ev.usuario || "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{ev.datos ? JSON.stringify(ev.datos).slice(0, 50) || "—" : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(ev.fecha || ev.createdAt || "").toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
