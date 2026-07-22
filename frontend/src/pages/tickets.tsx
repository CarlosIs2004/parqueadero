import { useState, useEffect } from "react"
import { ticketsApi, vehiclesApi, usersApi, spacesApi } from "@/lib/api"
import type { Ticket, Vehicle, User, Espacio } from "@/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Loader2, DollarSign, Ban } from "lucide-react"

const estadoBadge: Record<string, string> = {
  activo: "bg-blue-100 text-blue-800",
  pagado: "bg-green-100 text-green-800",
  anulado: "bg-red-100 text-red-800",
}

const tarifas: Record<string, number> = {
  Auto: 2.0,
  Moto: 1.0,
  Camioneta: 3.0,
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [t, v, u, e] = await Promise.all([
        ticketsApi.list(),
        vehiclesApi.list(),
        usersApi.list(),
        spacesApi.list(),
      ])
      setTickets(t || [])
      setVehicles(v || [])
      setUsers(u || [])
      setEspacios(e || [])
    } catch {
      toast.error("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData) as Record<string, string>

    if (!data.idEspacio || !data.idUsuario || !data.idVehiculo || !data.idEmpleado) {
      toast.error("Todos los campos obligatorios deben estar llenos")
      return
    }

    setSaving(true)
    try {
      await ticketsApi.create({
        idEspacio: data.idEspacio,
        idUsuario: data.idUsuario,
        idVehiculo: data.idVehiculo,
        fechaHoraIngreso: new Date().toISOString(),
        idEmpleado: data.idEmpleado,
      })
      toast.success("Ticket creado")
      setOpen(false)
      load()
    } catch {
      toast.error("Error al crear ticket")
    } finally {
      setSaving(false)
    }
  }

  const handleCobrar = async (id: string) => {
    try {
      await ticketsApi.cobrar(id)
      toast.success("Ticket cobrado")
      load()
    } catch {
      toast.error("Error al cobrar")
    }
  }

  const handleAnular = async (id: string) => {
    if (!confirm("¿Anular ticket?")) return
    try {
      await ticketsApi.anular(id)
      toast.success("Ticket anulado")
      load()
    } catch {
      toast.error("Error al anular")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Nuevo Ticket</Button>} />
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo Ticket</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idEspacio">Espacio *</Label>
                <Select name="idEspacio">
                  <SelectTrigger><SelectValue placeholder="Seleccionar espacio" /></SelectTrigger>
                  <SelectContent>
                    {espacios.filter((e) => e.estado === "DISPONIBLE").map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.codigo} - {e.tipo} ({e.nombreZona})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idUsuario">Propietario *</Label>
                <Select name="idUsuario">
                  <SelectTrigger><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
                  <SelectContent>
                    {users.filter((u) => u.active).map((u) => (
                      <SelectItem key={u.idPerson} value={u.idPerson}>{u.username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idVehiculo">Vehículo *</Label>
                <Select name="idVehiculo">
                  <SelectTrigger><SelectValue placeholder="Seleccionar vehículo" /></SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.placa} - {v.marca} {v.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idEmpleado">Recaudador *</Label>
                <Select name="idEmpleado">
                  <SelectTrigger><SelectValue placeholder="Seleccionar recaudador" /></SelectTrigger>
                  <SelectContent>
                    {users.filter((u) => u.active).map((u) => (
                      <SelectItem key={u.idPerson} value={u.idPerson}>{u.username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Ticket
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 text-sm">
        {Object.entries(tarifas).map(([tipo, tarifa]) => (
          <Badge key={tipo} variant="outline" className="text-xs">
            {tipo}: ${tarifa.toFixed(2)}/h
          </Badge>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Espacio</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Ingreso</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-28">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : tickets.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Sin tickets</TableCell></TableRow>
              ) : tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id.slice(0, 8)}</TableCell>
                  <TableCell>{t.idEspacio?.slice(0, 8) || t.idEspacio}</TableCell>
                  <TableCell>{t.vehiculo?.placa || t.idVehiculo.slice(0, 8)}</TableCell>
                  <TableCell className="text-xs">{new Date(t.fechaHoraIngreso).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">${t.valorRecaudado?.toFixed(2) || "—"}</TableCell>
                  <TableCell><Badge className={estadoBadge[t.estadoTicket || ""] || ""}>{t.estadoTicket || "—"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {t.estadoTicket === "activo" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleCobrar(t.id)}>
                            <DollarSign className="h-3 w-3 mr-1" /> Cobrar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAnular(t.id)}>
                            <Ban className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
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
