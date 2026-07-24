import { useState, useEffect, useCallback, useMemo } from "react"
import { vehiclesApi } from "@/lib/api"
import { z } from "zod"
import type { Vehicle, VehicleType, Clasificacion, TipoMoto, Cabina } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Plus, Pencil, Trash2, Loader2, Car, Gauge, DoorOpen, Box,
  Search, X, AlertTriangle, Fuel, Cpu, Snowflake,
  ChevronDown, ChevronUp
} from "lucide-react"

// ─── Zod schemas ──────────────────────────────────────────────────
const baseSchema = z.object({
  placa: z.string().min(6, "Mínimo 6 caracteres").max(10, "Máximo 10 caracteres").toUpperCase(),
  marca: z.string().min(2, "Requerido").max(30),
  modelo: z.string().min(1, "Requerido").max(30),
  color: z.string().min(3, "Requerido").max(20),
  anio: z.coerce.number().int().min(1885, "Año inválido").max(2027, "Año inválido"),
  clasificacion: z.enum(["Gasolina", "Diesel", "Electrico", "Hibrido"] as const),
})

const autoSchema = baseSchema.extend({
  tipo: z.literal("auto"),
  numeroPuertas: z.coerce.number().int().min(2, "Mínimo 2").max(6, "Máximo 6"),
  capacidadMaletero: z.coerce.number().int().min(0, "No puede ser negativo").max(2000),
})

const motoSchema = baseSchema.extend({
  tipo: z.literal("moto"),
  tipoMoto: z.enum(["Deportivo", "Scooter", "Motocross"] as const),
})

const camionetaSchema = baseSchema.extend({
  tipo: z.literal("camioneta"),
  cabina: z.enum(["Simple", "Doble"] as const),
  capacidadCarga: z.coerce.number().int().min(0, "No puede ser negativo").max(10000),
})

const vehicleSchema = z.discriminatedUnion("tipo", [autoSchema, motoSchema, camionetaSchema])

type VehicleFormData = z.infer<typeof vehicleSchema>

// ─── Helpers ──────────────────────────────────────────────────────
const tipoConfig: Record<string, { label: string; color: string; icon: typeof Car; bg: string; border: string }> = {
  auto: {
    label: "Auto",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    icon: Car,
    bg: "bg-blue-50/50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
  },
  moto: {
    label: "Moto",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    icon: Gauge,
    bg: "bg-purple-50/50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
  },
  camioneta: {
    label: "Camioneta",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    icon: Box,
    bg: "bg-orange-50/50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
  },
}

const clasificacionLabels: Record<string, string> = {
  Gasolina: "Gasolina",
  Diesel: "Diesel",
  Electrico: "Eléctrico",
  Hibrido: "Híbrido",
}

const clasificacionIcon: Record<string, typeof Fuel> = {
  Gasolina: Fuel,
  Diesel: Fuel,
  Electrico: Cpu,
  Hibrido: Snowflake,
}

const INITIAL_FORM: VehicleFormData = {
  tipo: "auto",
  placa: "",
  marca: "",
  modelo: "",
  color: "",
  anio: 2024 as unknown as never,
  clasificacion: "Gasolina",
  numeroPuertas: 4,
  capacidadMaletero: 470,
} as VehicleFormData

function getVehicleDetails(v: Vehicle): string {
  const t = v.tipo?.toLowerCase()
  if (t === "moto") return v.tipoMoto || "-"
  if (t === "auto") return `${v.numeroPuertas} puertas / ${v.capacidadMaletero}L`
  if (t === "camioneta") return `${v.cabina || "-"} / ${v.capacidadCarga}kg`
  return "-"
}

// ─── Componente ────────────────────────────────────────────────────
export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("todos")

  // Form / edit state
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<VehicleFormData>(INITIAL_FORM)

  // Delete confirm state
  const [deleting, setDeleting] = useState<Vehicle | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await vehiclesApi.list()
      setVehicles(data || [])
    } catch {
      toast.error("Error al cargar vehículos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Filtered list ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = vehicles
    if (filterTipo !== "todos") {
      list = list.filter((v) => v.tipo?.toLowerCase() === filterTipo)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (v) =>
          v.placa?.toLowerCase().includes(q) ||
          v.marca?.toLowerCase().includes(q) ||
          v.modelo?.toLowerCase().includes(q) ||
          v.color?.toLowerCase().includes(q)
      )
    }
    return list
  }, [vehicles, filterTipo, search])

  const counts = useMemo(() => {
    const total = vehicles.length
    const byTipo: Record<string, number> = {}
    for (const v of vehicles) {
      const t = (v.tipo || "auto").toLowerCase()
      byTipo[t] = (byTipo[t] || 0) + 1
    }
    return { total, byTipo }
  }, [vehicles])

  // ── Reset form ─────────────────────────────────────────────────
  const resetForm = () => {
    setForm(INITIAL_FORM)
    setErrors({})
    setEditing(null)
  }

  // ── Open for edit ──────────────────────────────────────────────
  const openEdit = (v: Vehicle) => {
    const tipo = (v.tipo || "auto").toLowerCase() as VehicleType
    setForm({
      tipo,
      placa: v.placa || "",
      marca: v.marca || "",
      modelo: v.modelo || "",
      color: v.color || "",
      anio: v.anio as unknown as never,
      clasificacion: (v.clasificacion as Clasificacion) || "Gasolina",
      numeroPuertas: v.numeroPuertas ?? 4,
      capacidadMaletero: v.capacidadMaletero ?? 470,
      tipoMoto: (v.tipoMoto as TipoMoto) || "Deportivo",
      cabina: (v.cabina as Cabina) || "Doble",
      capacidadCarga: v.capacidadCarga ?? 1500,
    })
    setEditing(v)
    setErrors({})
    setOpen(true)
  }

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const result = vehicleSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path.join(".")
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setSaving(true)
    try {
      // Create: nested { tipo, datos } — backend CreateVehiculoDto
      // Update: flat payload — backend UpdateVehiculoDto (solo campos base)
      if (editing) {
        const { tipo, ...rest } = result.data
        // Payload plano: el backend UpdateVehiculoDto acepta campos base + específicos
        await vehiclesApi.update(editing.id, rest as unknown as Record<string, unknown>)
        toast.success("Vehículo actualizado")
      } else {
        const payload = {
          tipo: result.data.tipo,
          datos: result.data,
        }
        await vehiclesApi.create(payload as unknown as Record<string, unknown>)
        toast.success("Vehículo creado")
      }

      setOpen(false)
      resetForm()
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingLoading(true)
    try {
      await vehiclesApi.delete(deleting.id)
      toast.success("Vehículo eliminado")
      setDeleting(null)
      load()
    } catch {
      toast.error("Error al eliminar")
    } finally {
      setDeletingLoading(false)
    }
  }

  // ── Helpers de formulario ──────────────────────────────────────
  const set = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => { const { [field]: _, ...rest } = prev; return rest })
  }

  const err = (field: string) =>
    errors[field] ? <p className="text-xs text-destructive mt-1">{errors[field]}</p> : null

  const isAuto = form.tipo === "auto"
  const isMoto = form.tipo === "moto"
  const isCamioneta = form.tipo === "camioneta"

  const SearchIcon = search ? X : Search

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehículos</h1>
          <p className="text-sm text-muted-foreground">
            {counts.total} vehículo{counts.total !== 1 ? "s" : ""} registrado{counts.total !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Nuevo Vehículo</Button>} />

          <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                {editing ? "Editar Vehículo" : "Registrar Vehículo"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-5">
              {/* Tipo selector */}
              <div className="space-y-2">
                <Label>Tipo de vehículo</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["auto", "moto", "camioneta"] as const).map((t) => {
                    const cfg = tipoConfig[t]
                    const Icon = cfg.icon
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set("tipo", t)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-sm font-medium transition-all cursor-pointer ${
                          form.tipo === t
                            ? `${cfg.border} ${cfg.bg} text-foreground`
                            : "border-muted bg-card text-muted-foreground hover:border-muted-foreground/30"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Datos básicos */}
              <div className="space-y-3 rounded-lg border bg-card p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Datos básicos</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="placa">Placa *</Label>
                    <Input
                      id="placa"
                      placeholder={isMoto ? "AB-123C" : "ABC-1234"}
                      value={form.placa}
                      onChange={(e) => set("placa", e.target.value.toUpperCase())}
                      className={errors.placa ? "border-destructive" : ""}
                    />
                    {err("placa")}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="marca">Marca *</Label>
                    <Input id="marca" value={form.marca} onChange={(e) => set("marca", e.target.value)} className={errors.marca ? "border-destructive" : ""} />
                    {err("marca")}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="modelo">Modelo *</Label>
                    <Input id="modelo" value={form.modelo} onChange={(e) => set("modelo", e.target.value)} className={errors.modelo ? "border-destructive" : ""} />
                    {err("modelo")}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="color">Color *</Label>
                    <Input id="color" value={form.color} onChange={(e) => set("color", e.target.value)} className={errors.color ? "border-destructive" : ""} />
                    {err("color")}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="anio">Año *</Label>
                    <Input id="anio" type="number" min={1885} max={2027} value={form.anio} onChange={(e) => set("anio", e.target.value)} className={errors.anio ? "border-destructive" : ""} />
                    {err("anio")}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Clasificación</Label>
                  <Select value={form.clasificacion} onValueChange={(v) => set("clasificacion", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["Gasolina", "Diesel", "Electrico", "Hibrido"] as const).map((c) => (
                        <SelectItem key={c} value={c}>{clasificacionLabels[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Campos según tipo */}
              {isAuto && (
                <div className={`space-y-3 rounded-lg border p-4 ${tipoConfig.auto.border} ${tipoConfig.auto.bg}`}>
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <DoorOpen className="h-4 w-4" /> Especificaciones de Auto
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="numeroPuertas">N° Puertas (2-6)</Label>
                      <Input id="numeroPuertas" type="number" min={2} max={6} value={form.numeroPuertas} onChange={(e) => set("numeroPuertas", e.target.value)} className={errors.numeroPuertas ? "border-destructive" : ""} />
                      {err("numeroPuertas")}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="capacidadMaletero">Cap. Maletero (L)</Label>
                      <Input id="capacidadMaletero" type="number" min={0} max={2000} value={form.capacidadMaletero} onChange={(e) => set("capacidadMaletero", e.target.value)} className={errors.capacidadMaletero ? "border-destructive" : ""} />
                      {err("capacidadMaletero")}
                    </div>
                  </div>
                </div>
              )}

              {isMoto && (
                <div className={`space-y-3 rounded-lg border p-4 ${tipoConfig.moto.border} ${tipoConfig.moto.bg}`}>
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <Gauge className="h-4 w-4" /> Especificaciones de Moto
                  </h3>
                  <div className="space-y-1">
                    <Label>Tipo de Moto</Label>
                    <Select value={form.tipoMoto} onValueChange={(v) => set("tipoMoto", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["Deportivo", "Scooter", "Motocross"] as const).map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {isCamioneta && (
                <div className={`space-y-3 rounded-lg border p-4 ${tipoConfig.camioneta.border} ${tipoConfig.camioneta.bg}`}>
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <Box className="h-4 w-4" /> Especificaciones de Camioneta
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Cabina</Label>
                      <Select value={form.cabina} onValueChange={(v) => set("cabina", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(["Simple", "Doble"] as const).map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="capacidadCarga">Cap. Carga (kg)</Label>
                      <Input id="capacidadCarga" type="number" min={0} max={10000} value={form.capacidadCarga} onChange={(e) => set("capacidadCarga", e.target.value)} className={errors.capacidadCarga ? "border-destructive" : ""} />
                      {err("capacidadCarga")}
                    </div>
                  </div>
                </div>
              )}

              {/* Error general + submit */}
              {errors.root && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md p-3">{errors.root}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm() }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(["todos", "auto", "moto", "camioneta"] as const).map((t) => {
            const active = filterTipo === t
            const Icon = t === "todos" ? null : tipoConfig[t].icon
            const label = t === "todos" ? "Todos" : tipoConfig[t].label
            const count = t === "todos" ? counts.total : (counts.byTipo[t] || 0)
            return (
              <button
                key={t}
                type="button"
                onClick={() => setFilterTipo(t)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {label}
                <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                  active ? "bg-primary-foreground/20" : "bg-background"
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
        <div className="relative w-full sm:w-64">
          <SearchIcon
            className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 ${
              search ? "text-primary cursor-pointer" : "text-muted-foreground"
            }`}
            onClick={() => { if (search) setSearch("") }}
          />
          <Input
            placeholder="Buscar por placa, marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Placa</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead>Marca / Modelo</TableHead>
                <TableHead className="hidden md:table-cell">Color</TableHead>
                <TableHead className="hidden lg:table-cell">Detalles</TableHead>
                <TableHead className="hidden sm:table-cell">Año</TableHead>
                <TableHead className="w-20">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">Cargando vehículos...</p>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    {search || filterTipo !== "todos" ? (
                      <>
                        <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          No se encontraron vehículos con esos filtros
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1"
                          onClick={() => { setSearch(""); setFilterTipo("todos") }}
                        >
                          Limpiar filtros
                        </Button>
                      </>
                    ) : (
                      <>
                        <Car className="mx-auto h-10 w-10 text-muted-foreground/40" />
                        <p className="mt-3 text-sm font-medium">No hay vehículos registrados</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Agregá el primer vehículo con el botón "Nuevo Vehículo"
                        </p>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((v) => {
                  const t = (v.tipo || "auto").toLowerCase()
                  const cfg = tipoConfig[t] || tipoConfig.auto
                  const Icon = cfg.icon
                  const ClasifIcon = clasificacionIcon[v.clasificacion || "Gasolina"] || Fuel
                  return (
                    <TableRow key={v.id} className="group">
                      {/* Ícono tipo */}
                      <TableCell className="pr-0">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${cfg.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </TableCell>

                      {/* Placa */}
                      <TableCell>
                        <span className="font-mono font-semibold tracking-wider text-sm">{v.placa}</span>
                      </TableCell>

                      {/* Tipo badge */}
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={cfg.color}>{cfg.label}</Badge>
                      </TableCell>

                      {/* Marca / Modelo */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm leading-tight">{v.marca}</span>
                          <span className="text-xs text-muted-foreground leading-tight">{v.modelo}</span>
                        </div>
                      </TableCell>

                      {/* Color */}
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-4 w-4 rounded-full border border-border shadow-sm"
                            style={{ backgroundColor: v.color?.toLowerCase() || "transparent" }}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm leading-tight">{v.color}</span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground leading-tight">
                              <ClasifIcon className="h-3 w-3" />
                              {clasificacionLabels[v.clasificacion || "Gasolina"]}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Detalles específicos */}
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">{getVehicleDetails(v)}</span>
                      </TableCell>

                      {/* Año */}
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm tabular-nums">{v.anio}</span>
                      </TableCell>

                      {/* Acciones */}
                      <TableCell>
                        <div className="flex gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(v)}
                            title="Editar"
                            className="h-8 w-8"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleting(v)}
                            title="Eliminar"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleting} onOpenChange={(v) => { if (!v) setDeleting(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Eliminar vehículo
            </DialogTitle>
          </DialogHeader>

          {deleting && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <div className="flex items-center gap-3">
                  {(() => {
                    const t = (deleting.tipo || "auto").toLowerCase()
                    const cfg = tipoConfig[t] || tipoConfig.auto
                    const Icon = cfg.icon
                    return (
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cfg.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    )
                  })()}
                  <div>
                    <p className="font-mono font-semibold text-lg">{deleting.placa}</p>
                    <p className="text-sm text-muted-foreground">
                      {deleting.marca} {deleting.modelo} · {deleting.anio}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Color:</span> {deleting.color}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>{" "}
                    {tipoConfig[(deleting.tipo || "auto").toLowerCase()]?.label || deleting.tipo}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clasificación:</span>{" "}
                    {clasificacionLabels[deleting.clasificacion || "Gasolina"]}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Detalles:</span> {getVehicleDetails(deleting)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm">
                <p className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Esta acción no se puede deshacer
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  El vehículo y todos sus datos asociados serán eliminados permanentemente.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleting(null)}
                  disabled={deletingLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={deletingLoading}
                >
                  {deletingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Eliminar vehículo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
