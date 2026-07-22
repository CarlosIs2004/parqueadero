import { useState, useEffect } from "react"
import { spacesApi, zonesApi } from "@/lib/api"
import type { Espacio, Zona, EspacioPayload, TipoEspacio, EstadoEspacio } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"

const estadoBadge: Record<string, string> = {
  DISPONIBLE: "bg-green-100 text-green-800",
  OCUPADO: "bg-red-100 text-red-800",
  INACTIVO: "bg-yellow-100 text-yellow-800",
}

export default function SpacesPage() {
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [zonas, setZonas] = useState<Zona[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Espacio | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [e, z] = await Promise.all([spacesApi.list(), zonesApi.list()])
      setEspacios(e || [])
      setZonas(z || [])
    } catch {
      toast.error("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const raw = Object.fromEntries(formData) as Record<string, string>
    const payload: EspacioPayload = {
      codigo: raw.codigo,
      idZona: raw.idZona,
      descripcion: raw.descripcion,
      tipo: raw.tipo as TipoEspacio,
      estado: (raw.estado || "DISPONIBLE") as EstadoEspacio,
    }
    setSaving(true)
    try {
      await spacesApi.create(payload)
      toast.success("Espacio creado")
      setOpen(false)
      load()
    } catch {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (esp: Espacio) => {
    if (!confirm("¿Eliminar espacio?")) return
    try {
      await spacesApi.delete(esp.id)
      toast.success("Espacio eliminado")
      load()
    } catch {
      toast.error("Error al eliminar")
    }
  }

  const handleEstadoChange = async (esp: Espacio, nuevoEstado: string) => {
    try {
      await spacesApi.cambiarEstado(esp.id, nuevoEstado)
      toast.success(`Estado cambiado a ${nuevoEstado}`)
      load()
    } catch {
      toast.error("Error al cambiar estado")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Espacios</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Nuevo Espacio</Button>} />
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo Espacio</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input id="codigo" name="codigo" placeholder="ESP-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select name="tipo" defaultValue="AUTO">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUTO">Auto</SelectItem>
                      <SelectItem value="MOTO">Moto</SelectItem>
                      <SelectItem value="BUSETA">Buseta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idZona">Zona *</Label>
                <Select name="idZona">
                  <SelectTrigger><SelectValue placeholder="Seleccionar zona" /></SelectTrigger>
                  <SelectContent>
                    {zonas.map((z) => (
                      <SelectItem key={z.idZona} value={z.idZona}>
                        {z.codigo} - {z.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input id="descripcion" name="descripcion" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado inicial</Label>
                <Select name="estado" defaultValue="DISPONIBLE">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                    <SelectItem value="OCUPADO">Ocupado</SelectItem>
                    <SelectItem value="INACTIVO">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="w-40">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : espacios.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sin espacios</TableCell></TableRow>
              ) : espacios.map((esp) => (
                <TableRow key={esp.id}>
                  <TableCell className="font-mono font-medium">{esp.codigo}</TableCell>
                  <TableCell><Badge variant="outline">{esp.tipo}</Badge></TableCell>
                  <TableCell>{esp.nombreZona || "—"}</TableCell>
                  <TableCell><Badge className={estadoBadge[esp.estado]}>{esp.estado}</Badge></TableCell>
                  <TableCell>{esp.activo ? "Sí" : "No"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Select defaultValue="" onValueChange={(v) => v && handleEstadoChange(esp, v)}>
                        <SelectTrigger className="h-8 w-28"><SelectValue placeholder="Estado" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                          <SelectItem value="OCUPADO">Ocupado</SelectItem>
                          <SelectItem value="INACTIVO">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(esp)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
