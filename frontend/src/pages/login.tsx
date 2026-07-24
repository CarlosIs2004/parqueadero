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
  username: z.string().min(4, "Mínimo 4 caracteres").max(15, "Máximo 15 caracteres").regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guión bajo"),
  password: z.string().min(11, "Contraseña debe tener al menos 11 caracteres"),
})

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema })
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const submission = parseWithZod(formData, { schema })
    if (submission.status !== "success") return
    const { username, password } = Object.fromEntries(formData) as { username: string; password: string }

    setLoading(true)
    try {
      await login(username, password)
      toast.success("Inicio de sesión exitoso", { id: "login-success" })
      navigate("/dashboard")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Credenciales inválidas"
      toast.error(msg, { id: "login-error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <><Toaster richColors position="top-right" />
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Parqueadero</CardTitle>
          <CardDescription>Sistema de Gestión de Estacionamiento</CardDescription>
        </CardHeader>
        <CardContent>
          <form id={form.id} onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" name="username" placeholder="admin" required />
              {fields.username.errors && <p className="text-sm text-destructive">{fields.username.errors}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" placeholder="••••••" required />
              {fields.password.errors && <p className="text-sm text-destructive">{fields.password.errors}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar sesión
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Registrarse
            </Link>
          </p>
        </CardContent>
      </Card>
    </div></>
  )
}
