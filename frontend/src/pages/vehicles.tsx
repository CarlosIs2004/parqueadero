import { useState, useEffect } from "react"
import { vehiclesApi } from "@/lib/api"
import type { Vehicle, CreateVehiculoPayload, VehicleType, Clasificacion, TipoMoto, Cabina } from "@/types"
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

const tipoColors: Record<string, string> = {
  Auto: "bg-blue-100 text-blue-800",
  Moto: "bg-purple-100 text-purple-800",
  Camioneta: "bg-orange-100 text-orange-800",
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [saving, setSaving] = useState(false)
  const [tipo, setTipo] = useState<VehicleType>("auto")

  const load = async () => {
    try {
      const data = await vehiclesApi.list()
      setVehicles(data || [])
    } catch {
      toast.error("Error al cargar vehículos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const raw = Object.fromEntries(formData) as Record<string, string>

    const payload = {
      tipo,
      datos: {
        placa: raw.placa,
        marca: raw.marca,
        modelo: raw.modelo,
        color: raw.color,
        anio: parseInt(raw.anio),
        clasificacion: raw.clasificacion as Clasificacion,
        ...(tipo === "auto" && {
          numeroPuertas: parseInt(raw.numeroPuertas),
          capacidadMaletero: parseInt(raw.capacidadMaletero),
        }),
        ...(tipo === "moto" && {
          tipoMoto: raw.tipoMoto as TipoMoto,
        }),
        ...(tipo === "camioneta" && {
          cabina: raw.cabina as Cabina,
          capacidadCarga: parseInt(raw.capacidadCarga),
        }),
      },
    }

    setSaving(true)
    try {
      await vehiclesApi.create(payload as unknown as Record<string, unknown>)
      toast.success("Vehículo creado")
      setOpen(false)
      load()
    } catch {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar vehículo?")) return
    try {
      await vehiclesApi.delete(id)
      toast.success("Vehículo eliminado")
      load()
    } catch {
      toast.error("Error al eliminar")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vehículos</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setTipo("auto") }}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Nuevo Vehículo</Button>} />
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nuevo Vehículo</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={(v) => v !== null && setTipo(v as VehicleType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="moto">Moto</SelectItem>
                    <SelectItem value="camioneta">Camioneta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="placa">Placa *</Label>
                  <Input id="placa" name="placa" placeholder={tipo === "moto" ? "AB-123C" : "ABC-1234"} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca *</Label>
                  <Input id="marca" name="marca" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Input id="modelo" name="modelo" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color *</Label>
                  <Input id="color" name="color" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="anio">Año *</Label>
                  <Input id="anio" name="anio" type="number" min={1885} max={2027} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clasificacion">Clasificación</Label>
                  <Select name="clasificacion" defaultValue="Gasolina">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gasolina">Gasolina</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Electrico">Eléctrico</SelectItem>
                      <SelectItem value="Hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {tipo === "auto" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeroPuertas">N° Puertas (2-5)</Label>
                    <Input id="numeroPuertas" name="numeroPuertas" type="number" min={2} max={5} defaultValue={4} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacidadMaletero">Cap. Maletero (L)</Label>
                    <Input id="capacidadMaletero" name="capacidadMaletero" type="number" min={0} defaultValue={470} />
                  </div>
                </div>
              )}

              {tipo === "moto" && (
                <div className="space-y-2">
                  <Label htmlFor="tipoMoto">Tipo de Moto</Label>
                  <Select name="tipoMoto" defaultValue="Deportivo">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Deportivo">Deportivo</SelectItem>
                      <SelectItem value="Scooter">Scooter</SelectItem>
                      <SelectItem value="Motocross">Motocross</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {tipo === "camioneta" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cabina">Cabina</Label>
                    <Select name="cabina" defaultValue="Doble">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Simple">Simple</SelectItem>
                        <SelectItem value="Doble">Doble</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacidadCarga">Cap. Carga (kg)</Label>
                    <Input id="capacidadCarga" name="capacidadCarga" type="number" min={0} max={100000} defaultValue={1500} />
                  </div>
                </div>
              )}

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
                <TableHead>Placa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Marca / Modelo</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Año</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : vehicles.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sin vehículos</TableCell></TableRow>
              ) : vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono font-medium">{v.placa}</TableCell>
                  <TableCell><Badge className={tipoColors[v.tipo] || ""}>{v.tipo}</Badge></TableCell>
                  <TableCell>{v.marca} {v.modelo}</TableCell>
                  <TableCell>{v.color}</TableCell>
                  <TableCell>{v.anio}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}>
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
