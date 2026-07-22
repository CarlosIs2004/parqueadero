import { useState, useEffect } from "react"
import { asignacionesApi, usersApi, vehiclesApi } from "@/lib/api"
import type { Asignacion, User, Vehicle } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Trash2, Loader2 } from "lucide-react"

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Asignacion[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState("")

  const load = async () => {
    try {
      const [a, u, v] = await Promise.all([
        asignacionesApi.list(),
        usersApi.list(),
        vehiclesApi.list(),
      ])
      setAssignments(a || [])
      setUsers(u || [])
      setVehicles(v || [])
    } catch {
      toast.error("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!selectedUser || !selectedVehicle) {
      toast.error("Selecciona usuario y vehículo")
      return
    }
    setSaving(true)
    try {
      await asignacionesApi.create({ userId: selectedUser, vehicleId: selectedVehicle })
      toast.success("Asignación creada")
      setOpen(false)
      setSelectedUser("")
      setSelectedVehicle("")
      load()
    } catch {
      toast.error("Error al crear asignación")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (userId: string, vehicleId: string) => {
    if (!confirm("¿Eliminar asignación?")) return
    try {
      await asignacionesApi.delete(userId, vehicleId)
      toast.success("Asignación eliminada")
      load()
    } catch {
      toast.error("Error al eliminar")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Asignaciones</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger >
            <Button><Plus className="mr-2 h-4 w-4" /> Nueva Asignación</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Asignar Vehículo a Propietario</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Propietario</Label>
                <Select value={selectedUser} onValueChange={(v) => v !== null && setSelectedUser(v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
                  <SelectContent>
                    {users.filter((u) => u.active).map((u) => (
                      <SelectItem key={u.idPerson} value={u.idPerson}>{u.username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vehículo</Label>
                <Select value={selectedVehicle} onValueChange={(v) => v !== null && setSelectedVehicle(v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar vehículo" /></SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={(v as any).id} value={(v as any).id}>
                        {(v as any).placa} - {(v as any).marca} {(v as any).modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={saving} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Asignar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propietario</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Fecha Asignación</TableHead>
                <TableHead className="w-20">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : assignments.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Sin asignaciones</TableCell></TableRow>
              ) : assignments.map((a) => (
                <TableRow key={`${a.userId}-${a.vehicleId}`}>
                  <TableCell>{a.user?.username || a.userId}</TableCell>
                  <TableCell>{(a.vehicle as any)?.placa || a.vehicleId}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {a.fechaAsignacion ? new Date(a.fechaAsignacion).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a.userId, a.vehicleId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
