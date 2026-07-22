import { useState, useEffect } from "react"
import { usersApi } from "@/lib/api"
import type { User } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"
import { useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { z } from "zod"

const schema = z.object({
  idPerson: z.string().uuid("UUID inválido"),
  username: z.string().min(4, "Mínimo 4 caracteres").max(15, "Máximo 15").regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y _"),
  password: z.string().min(11, "Mínimo 11 caracteres").max(255),
})

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema })
    },
  })

  const load = async () => {
    try {
      const data = await usersApi.list()
      setUsers(data || [])
    } catch {
      toast.error("Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    setSaving(true)
    try {
      await usersApi.create(data as Partial<User>)
      toast.success("Usuario creado")
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
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Nuevo</Button>} />
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo Usuario</DialogTitle></DialogHeader>
            <form id={form.id} onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idPerson">ID Persona (UUID)</Label>
                <Input id="idPerson" name="idPerson" placeholder="550e8400-e29b-41d4-a716-446655440000" required />
                {fields.idPerson?.errors && <p className="text-sm text-destructive">{fields.idPerson.errors}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Usuario (4-15 caracteres)</Label>
                <Input id="username" name="username" required />
                {fields.username?.errors && <p className="text-sm text-destructive">{fields.username.errors}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña (mín. 11 caracteres)</Label>
                <Input id="password" name="password" type="password" required />
                {fields.password?.errors && <p className="text-sm text-destructive">{fields.password.errors}</p>}
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
                <TableHead>Usuario</TableHead>
                <TableHead>ID Persona</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Creado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Sin usuarios</TableCell></TableRow>
              ) : users.map((u) => (
                <TableRow key={u.idPerson}>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell className="font-mono text-xs">{u.idPerson}</TableCell>
                  <TableCell><Badge variant={u.active ? "default" : "secondary"}>{u.active ? "Activo" : "Inactivo"}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
