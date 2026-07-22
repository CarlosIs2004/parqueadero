import { useState, useEffect } from "react"
import { personsApi } from "@/lib/api"
import type { Person } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"

export default function PersonsPage() {
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const data = await personsApi.list()
      setPersons(data || [])
    } catch {
      toast.error("Error al cargar personas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData) as Record<string, string>
    if (!data.middleName) delete data.middleName

    setSaving(true)
    try {
      await personsApi.create(data as unknown as Partial<Person & { password?: string }>)
      toast.success("Persona creada")
      setOpen(false)
      load()
    } catch {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Personas</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Nueva Persona</Button>} />
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nueva Persona (con usuario)</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre * (máx. 30)</Label>
                  <Input id="firstName" name="firstName" maxLength={30} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido * (máx. 30)</Label>
                  <Input id="lastName" name="lastName" maxLength={30} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Segundo nombre (máx. 30)</Label>
                <Input id="middleName" name="middleName" maxLength={30} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dni">Cédula (10 dígitos) *</Label>
                  <Input id="dni" name="dni" minLength={10} maxLength={10} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono * (máx. 15)</Label>
                  <Input id="phone" name="phone" maxLength={15} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email * (máx. 50)</Label>
                <Input id="email" name="email" type="email" maxLength={50} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nacionalidad (máx. 30)</Label>
                  <Input id="nationality" name="nationality" maxLength={30} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" name="address" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario (4-15 carac.) *</Label>
                  <Input id="username" name="username" minLength={4} maxLength={15} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña (mín. 11) *</Label>
                  <Input id="password" name="password" type="password" minLength={11} maxLength={60} required />
                </div>
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
                <TableHead>Nombres</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : persons.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sin personas</TableCell></TableRow>
              ) : persons.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.firstName} {p.lastName}</TableCell>
                  <TableCell>{p.dni}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.user?.username || "—"}</TableCell>
                  <TableCell><Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Activo" : "Inactivo"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
