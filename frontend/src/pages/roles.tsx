import { useState, useEffect } from "react"
import { rolesApi, userRoleApi, usersApi } from "@/lib/api"
import type { Role, User } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2, Link2, Unlink } from "lucide-react"

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [openRole, setOpenRole] = useState(false)
  const [openAssign, setOpenAssign] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedRoleId, setSelectedRoleId] = useState("")

  const load = async () => {
    try {
      const [r, u] = await Promise.all([rolesApi.list(), usersApi.list()])
      setRoles(r || [])
      setUsers(u || [])
    } catch {
      toast.error("Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmitRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    setSaving(true)
    try {
      if (editing) {
        await rolesApi.update(editing.id, data as Partial<Role>)
        toast.success("Rol actualizado")
      } else {
        await rolesApi.create(data as Partial<Role>)
        toast.success("Rol creado")
      }
      setOpenRole(false)
      setEditing(null)
      load()
    } catch {
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar rol?")) return
    try {
      await rolesApi.delete(id)
      toast.success("Rol eliminado")
      load()
    } catch {
      toast.error("Error al eliminar")
    }
  }

  const handleAssign = async () => {
    if (!selectedUserId || !selectedRoleId) {
      toast.error("Selecciona usuario y rol")
      return
    }
    try {
      await userRoleApi.assign(selectedUserId, selectedRoleId)
      toast.success("Rol asignado")
      setOpenAssign(false)
      setSelectedUserId("")
      setSelectedRoleId("")
    } catch {
      toast.error("Error al asignar")
    }
  }

  const handleUnassign = async (userId: string, roleId: string) => {
    if (!confirm("¿Remover asignación?")) return
    try {
      await userRoleApi.remove(userId, roleId)
      toast.success("Asignación removida")
      load()
    } catch {
      toast.error("Error al remover")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roles</h1>
        <div className="flex gap-2">
          <Dialog open={openAssign} onOpenChange={setOpenAssign}>
            <DialogTrigger >
              <Button variant="outline"><Link2 className="mr-2 h-4 w-4" /> Asignar Rol</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Asignar Rol a Usuario</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Usuario</Label>
                  <Select value={selectedUserId} onValueChange={(v) => v !== null && setSelectedUserId(v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
                    <SelectContent>
                      {users.filter((u) => u.active).map((u) => (
                        <SelectItem key={u.idPerson} value={u.idPerson}>{u.username}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select value={selectedRoleId} onValueChange={(v) => v !== null && setSelectedRoleId(v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                    <SelectContent>
                      {roles.filter((r) => r.active).map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAssign} className="w-full">Asignar</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={openRole} onOpenChange={(v) => { setOpenRole(v); if (!v) setEditing(null) }}>
            <DialogTrigger >
              <Button><Plus className="mr-2 h-4 w-4" /> Nuevo Rol</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} Rol</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmitRole} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" defaultValue={editing?.name || ""} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input id="description" name="description" defaultValue={editing?.description || ""} />
                </div>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? "Actualizar" : "Crear"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : roles.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Sin roles</TableCell></TableRow>
              ) : roles.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.description || "—"}</TableCell>
                  <TableCell><Badge variant={r.active ? "default" : "secondary"}>{r.active ? "Activo" : "Inactivo"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setOpenRole(true) }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
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
