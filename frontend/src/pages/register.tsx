import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/providers/auth-provider"
import { useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"

const schema = z.object({
  firstName: z.string().min(1, "Requerido").max(30, "Máximo 30 caracteres").regex(/^[A-Za-zÁáÉéÍíÓóÚúÑñÜü\s]+$/, "Solo letras"),
  lastName: z.string().min(1, "Requerido").max(30, "Máximo 30 caracteres").regex(/^[A-Za-zÁáÉéÍíÓóÚúÑñÜü\s]+$/, "Solo letras"),
  middleName: z.string().max(30, "Máximo 30 caracteres").regex(/^[A-Za-zÁáÉéÍíÓóÚúÑñÜü\s]*$/, "Solo letras").optional().or(z.literal("")),
  dni: z.string().length(10, "Debe tener exactamente 10 dígitos").regex(/^\d+$/, "Solo números"),
  email: z.string().email("Email inválido").max(50, "Máximo 50 caracteres"),
  phone: z.string().min(7, "Mínimo 7 dígitos").max(15, "Máximo 15 caracteres").regex(/^\d+$/, "Solo números"),
  nationality: z.string().min(1, "Requerido").max(30, "Máximo 30 caracteres").regex(/^[A-Za-zÁáÉéÍíÓóÚúÑñÜü\s]+$/, "Solo letras"),
  address: z.string().min(1, "Dirección requerida"),
  username: z.string().min(4, "Mínimo 4 caracteres").max(15, "Máximo 15 caracteres").regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guión bajo"),
  password: z.string().min(11, "Mínimo 11 caracteres").max(60, "Máximo 60 caracteres"),
})

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema })
    },
    onSubmit: async (event, { formData }) => {
      event.preventDefault()
      const data = Object.fromEntries(formData) as Record<string, unknown>
      setLoading(true)
      try {
        await register(data)
        toast.success("Registro exitoso. Ahora puedes iniciar sesión.", { id: "register-success" })
        navigate("/login")
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al registrar"
        toast.error(msg, { id: "register-error" })
      } finally {
        setLoading(false)
      }
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  })

  return (
    <><Toaster richColors position="top-right" />
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>Regístrate como cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <form id={form.id} onSubmit={form.onSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input id="firstName" name="firstName" placeholder="Juan" required />
                {fields.firstName.errors && <p className="text-sm text-destructive">{fields.firstName.errors}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input id="lastName" name="lastName" placeholder="Pérez" required />
                {fields.lastName.errors && <p className="text-sm text-destructive">{fields.lastName.errors}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">Segundo nombre</Label>
              <Input id="middleName" name="middleName" placeholder="Antonio" />
              {fields.middleName.errors && <p className="text-sm text-destructive">{fields.middleName.errors}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dni">Cédula (10 dígitos) *</Label>
                <Input id="dni" name="dni" placeholder="1234567890" required />
                {fields.dni.errors && <p className="text-sm text-destructive">{fields.dni.errors}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input id="phone" name="phone" placeholder="0999123456" required />
                {fields.phone.errors && <p className="text-sm text-destructive">{fields.phone.errors}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" placeholder="juan@mail.com" required />
              {fields.email.errors && <p className="text-sm text-destructive">{fields.email.errors}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nationality">Nacionalidad *</Label>
                <Input id="nationality" name="nationality" placeholder="ecuatoriana" required />
                {fields.nationality.errors && <p className="text-sm text-destructive">{fields.nationality.errors}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input id="address" name="address" placeholder="Calle 123" required />
                {fields.address.errors && <p className="text-sm text-destructive">{fields.address.errors}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario (4-15 caracteres) *</Label>
                <Input id="username" name="username" placeholder="juanperez" required />
                {fields.username.errors && <p className="text-sm text-destructive">{fields.username.errors}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña (mín. 11 caracteres) *</Label>
                <Input id="password" name="password" type="password" placeholder="••••••" required />
                {fields.password.errors && <p className="text-sm text-destructive">{fields.password.errors}</p>}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrarse
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div></>
  )
}
