import { useState, useEffect } from "react"
import { zonesApi } from "@/lib/api"
import type { Zona, ZonaPayload, TipoZona } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Loader2, ToggleLeft } from "lucide-react"

export default function ZonesPage() {
  const [zones, setZones] = useState<Zona[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const data = await zonesApi.list()
      setZones(data || [])
    } catch {
      toast.error("Error al cargar zonas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const raw = Object.fromEntries(formData) as Record<string, string>
    const payload: ZonaPayload = {
      nombre: raw.nombre,
      descripcion: raw.descripcion,
      tipo: raw.tipo as TipoZona,
      capacidad: parseInt(raw.capacidad),
    }
    setSaving(true)
    try {
      await zonesApi.create(payload)
      toast.success("Zona creada")
      setOpen(false)
      load()
    } catch {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (z: Zona) => {
    try {
      await zonesApi.toggleEstado(z.idZona)
      toast.success("Estado cambiado")
      load()
    } catch {
      toast.error("Error al cambiar estado")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Zonas</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Nueva Zona</Button>} />
          <DialogContent>
            <DialogHeader><DialogTitle>Nueva Zona</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre * (máx. 32 caracteres)</Label>
                  <Input id="nombre" name="nombre" maxLength={32} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select name="tipo" defaultValue="REGULAR">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="REGULAR">Regular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacidad">Capacidad (1-100)</Label>
                <Input id="capacidad" name="capacidad" type="number" min={1} max={100} defaultValue={10} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea id="descripcion" name="descripcion" />
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
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-20">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : zones.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sin zonas</TableCell></TableRow>
              ) : zones.map((z) => (
                <TableRow key={z.idZona}>
                  <TableCell className="font-mono font-medium">{z.codigo}</TableCell>
                  <TableCell>{z.nombre}</TableCell>
                  <TableCell><Badge variant="outline">{z.tipo}</Badge></TableCell>
                  <TableCell>{z.capacidad}</TableCell>
                  <TableCell><Badge variant={z.estado === 1 ? "default" : "secondary"}>{z.estado === 1 ? "Activo" : "Inactivo"}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleToggle(z)}>
                      <ToggleLeft className="h-4 w-4" />
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
