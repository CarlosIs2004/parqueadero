# API Gateway — Sistema de Gestión de Estacionamiento (Parqueadero)

**Microservicios** para gestión de parqueadero con Kong API Gateway.  
Proyecto estudiantil — Universidad de las Fuerzas Armadas ESPE.  
*Aplicaciones Distribuidas*

**Integrantes:** Kevin Amaguaña — Carlos Ñato

---

## Arquitectura

```
┌─────────────┐     ┌─────────────────────────────────────────────────┐
│  Dashboard  │     │              Kong API Gateway                   │
│ (Vanilla JS)│────▶│  localhost:8000  (rate-limit 30/min + CORS)     │
└─────────────┘     └───────┬──────┬──────┬──────┬──────┬────────────┘
                            │      │      │      │      │
         ┌──────────────────┘      │      │      │      └──────────────┐
         │                         │      │      │                     │
    ┌────▼────┐           ┌────────▼──┐ ┌──▼──────┐ ┌──────────▼──┐  ┌─▼──────────┐
    │ Usuarios│           │ Vehículos │ │ Zonas   │ │ Reservas   │  │ Tickets    │
    │ :3001   │           │ :3000     │ │ :8080   │ │ :3002      │  │ :3004      │
    │ NestJS  │           │ NestJS    │ │SpringBoot│ │ NestJS     │  │ NestJS     │
    └────┬────┘           └─────┬─────┘ └──┬───────┘ └─────┬──────┘  └────┬──────┘
         │                      │          │               │             │
         └──────────┬───────────┘          │               │             │
                    │                      │               │             │
              ┌─────▼──────┐       ┌───────▼─────┐   ┌────▼─────┐       │
              │  RabbitMQ  │       │ PostgreSQL  │   │ Ms-Audit │◄──────┘
              │  :5672     │       │ :5432       │   │ :3005    │
              │  audit_queue│      │ (4 databases)│  │ (audit_db│
              └────────────┘       └─────────────┘   │  :5433)  │
                                                     └──────────┘
```

---

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| API Gateway | Kong (DB-less, declarativo) |
| Microservicios | NestJS 11 (TypeScript) — 6 servicios |
| Zonas | Spring Boot 4.0.6 (Java 21) |
| Docs Hub | Express + swagger-ui-dist |
| Base de datos | PostgreSQL 15 |
| Mensajería | RabbitMQ 3 (auditoría asíncrona) |
| Frontend | Vanilla HTML + Tailwind CSS (CDN) + SSE |

---

## Servicios

| Servicio | Puerto Interno | Contenedor | Tech |
|---|---|---|---|
| Vehículos | 3000 | vehiculos_app | NestJS 11 + TypeORM |
| Usuarios | 3001 | usuarios_app | NestJS 11 + TypeORM |
| Reservas | 3002 | reservas_app | NestJS 11 + TypeORM |
| Docs | 3003 | docs_service | Express |
| Tickets | 3004 | tickets_app | NestJS 11 + TypeORM |
| Ms-Audit | 3005 | ms_audit_app | NestJS 11 + TypeORM |
| Zonas | 8080 | zonas_app | Spring Boot 4 + JPA |
| Kong | 8000 | kong_gateway | Kong latest (DB-less) |
| RabbitMQ | 5672 / 15672 | rabbitmq_audit | RabbitMQ 3-management |
| PostgreSQL | 5432 | postgres_data | Postgres 15 |
| PostgreSQL Audit | 5433 | postgres_audit | Postgres 15 |

---

## Cómo ejecutar

```bash
# Iniciar todo
docker compose up -d

# Ver logs
docker compose logs -f

# Detener y limpiar volúmenes (borra datos)
docker compose down -v

# Reconstruir imágenes después de cambios
docker compose build --no-cache <servicio>
```

### Datos de semilla (se crean automáticamente al iniciar)

| Servicio | Datos |
|---|---|
| **Usuarios** | Roles: `cliente`, `admin`, `recaudador`, `root` |
| | Admin: `admin` / `admin123admin` (tiene todos los roles) |
| **Zonas** | `VIP-01` (Zona VIP — 5 espacios AUTO) |
| | `REG-01` (Parqueadero General — 10 espacios: 5 AUTO, 3 MOTO, 2 BUSETA) |
| **Vehículos** | 3 Autos, 2 Motos, 1 Camioneta |

### Documentación Swagger

Disponible en [`http://localhost:8000/api/docs`](http://localhost:8000/api/docs) (hub con tabs para cada servicio).

---

## Endpoints por Servicio

Todos los endpoints expuestos via Kong en `http://localhost:8000`.  
Salvo los marcados como `@Public()`, todos requieren `Authorization: Bearer <access_token>`.

---

### 🔐 Autenticación — `Usuarios (auth)`

| Método | Kong Path | Interno | Auth | Roles | Descripción |
|---|---|---|---|---|---|
| `POST` | `/api/auth/login` | `/auth/login` | ❌ Público | — | Iniciar sesión |
| `POST` | `/api/auth/register` | `/auth/register` | ❌ Público | — | Registrar como cliente |
| `POST` | `/api/auth/refresh` | `/auth/refresh` | ❌ Público | — | Renovar access_token |

**POST /api/auth/login**
```json
{ "username": "admin", "password": "admin123admin", "mac?": "00:1A:2B:3C:4D:5E" }
```
→ `{ "access_token": "...", "refresh_token": "..." }`

**POST /api/auth/register**
```json
{
  "firstName": "Juan", "lastName": "Pérez", "middleName": "",
  "dni": "1234567890", "email": "juan@mail.com", "phone": "0999123456",
  "nationality": "ecuatoriana", "address": "Calle 123",
  "username": "juanperez", "password": "micontraseña123",
  "mac?": "00:1A:2B:3C:4D:5E"
}
```

---

### 👤 Usuarios — `Usuarios (CRUD)`

Base: `http://usuarios_app:3001/users` — vía Kong: `/api/usuarios`

| Método | Kong Path | Interno | Auth | Roles | Descripción |
|---|---|---|---|---|---|
| `POST` | `/api/usuarios` | `/users` | JWT | admin | Crear usuario |
| `GET` | `/api/usuarios` | `/users` | JWT | admin | Listar usuarios |
| `GET` | `/api/usuarios/:id` | `/users/:id` | JWT | admin | Obtener usuario |
| `PATCH` | `/api/usuarios/:id` | `/users/:id` | JWT | admin | Actualizar usuario |
| `DELETE` | `/api/usuarios/:id` | `/users/:id` | JWT | admin | Soft delete |
| `DELETE` | `/api/usuarios/:id/hard` | `/users/:id/hard` | JWT | root | Hard delete |
| `GET` | `/api/usuarios/:id/roles` | `/users/:id/roles` | ❌ Público | — | Roles del usuario (uso interno) |

---

### 👤 Personas — `Usuarios (persons)`

Base: `http://usuarios_app:3001/persons` — vía Kong: `/api/persons`

| Método | Kong Path | Interno | Auth | Roles | Descripción |
|---|---|---|---|---|---|
| `POST` | `/api/persons` | `/persons` | JWT | admin | Crear persona + usuario |
| `POST` | `/api/persons/only` | `/persons/only` | JWT | admin | Crear solo persona (sin usuario) |
| `GET` | `/api/persons/me` | `/persons/me` | JWT | auth (cualquiera) | Mi perfil |
| `PATCH` | `/api/persons/me` | `/persons/me` | JWT | auth (cualquiera) | Actualizar mi perfil |
| `GET` | `/api/persons` | `/persons` | JWT | admin | Listar personas |
| `GET` | `/api/persons/:id` | `/persons/:id` | JWT | admin | Obtener persona |
| `PATCH` | `/api/persons/:id` | `/persons/:id` | JWT | admin | Actualizar persona |
| `DELETE` | `/api/persons/:id` | `/persons/:id` | JWT | admin | Soft delete |
| `DELETE` | `/api/persons/:id/hard` | `/persons/:id/hard` | JWT | root | Hard delete |

---

### 👤 Roles — `Usuarios (roles)`

Base: `http://usuarios_app:3001/roles` — vía Kong: `/api/roles`

| Método | Kong Path | Interno | Auth | Roles | Descripción |
|---|---|---|---|---|---|
| `POST` | `/api/roles` | `/roles` | JWT | admin, root | Crear rol |
| `GET` | `/api/roles` | `/roles` | JWT | admin, root | Listar roles |
| `GET` | `/api/roles/:id` | `/roles/:id` | JWT | admin, root | Obtener rol |
| `PATCH` | `/api/roles/:id` | `/roles/:id` | JWT | admin, root | Actualizar rol |
| `DELETE` | `/api/roles/:id` | `/roles/:id` | JWT | admin, root | Soft delete |
| `DELETE` | `/api/roles/:id/hard` | `/roles/:id/hard` | JWT | root | Hard delete |

---

### 👤 Asignación Roles — `Usuarios (user-role)`

Base: `http://usuarios_app:3001/user-role` — vía Kong: `/api/user-role`

| Método | Kong Path | Interno | Auth | Roles | Descripción |
|---|---|---|---|---|---|
| `POST` | `/api/user-role` | `/user-role` | JWT | admin, root | Asignar rol a usuario |
| `DELETE` | `/api/user-role/:userId/:roleId` | `/user-role/:idUser/:idRole` | JWT | admin, root | Remover asignación (soft) |
| `DELETE` | `/api/user-role/:userId/:roleId/hard` | `/user-role/:idUser/:idRole/hard` | JWT | root | Hard delete asignación |
| `GET` | `/api/user-role/user/:userId` | `/user-role/user/:idUser` | JWT | admin, root | Roles de un usuario |
| `GET` | `/api/user-role/role/:roleId` | `/user-role/role/:idRole` | JWT | admin, root | Usuarios con un rol |

---

### 🚗 Vehículos

Base: `http://vehiculos_app:3000/vehiculos` — vía Kong: `/api/vehiculos`

| Método | Kong Path | Interno | Auth | Roles | Descripción |
|---|---|---|---|---|---|
| `POST` | `/api/vehiculos` | `/vehiculos` | JWT | admin | Crear vehículo |
| `GET` | `/api/vehiculos` | `/vehiculos` | JWT | auth (cualquiera) | Listar vehículos (`?tipo=auto\|moto\|camioneta`) |
| `GET` | `/api/vehiculos/:id` | `/vehiculos/:id` | JWT | auth (cualquiera) | Obtener vehículo |
| `PATCH` | `/api/vehiculos/:id` | `/vehiculos/:id` | JWT | admin | Actualizar vehículo |
| `DELETE` | `/api/vehiculos/:id` | `/vehiculos/:id` | JWT | admin, root | Eliminar vehículo (valida que no tenga tickets activos) |

**POST /api/vehiculos** — DTO con discriminador `tipo`:
```json
// Auto
{ "tipo": "auto", "placa": "ABC-1234", "marca": "Toyota", "modelo": "Corolla",
  "color": "Rojo", "anio": 2024, "clasificacion": "Gasolina",
  "numeroPuertas": 4, "capacidadMaletero": 470 }

// Moto
{ "tipo": "moto", "placa": "MTO-001", "marca": "Yamaha", "modelo": "MT-07",
  "color": "Negro", "anio": 2023, "clasificacion": "Gasolina",
  "tipoMoto": "Deportivo" }

// Camioneta
{ "tipo": "camioneta", "placa": "CAM-001", "marca": "Ford", "modelo": "Ranger",
  "color": "Blanca", "anio": 2023, "clasificacion": "Diesel",
  "cabina": "Doble", "capacidadCarga": 1500 }
```

---

### 🅿️ Zonas

Base: `http://zonas:8080/api/v1/zonas` — vía Kong: `/api/zonas`

| Método | Kong Path | Interno | Auth | Roles | Descripción |
|---|---|---|---|---|---|
| `GET` | `/api/zonas` | `/api/v1/zonas` | JWT | — | Listar zonas |
| `GET` | `/api/zonas/:id` | `/api/v1/zonas/:idZona` | JWT | — | Obtener zona |
| `POST` | `/api/zonas` | `/api/v1/zonas` | JWT | — | Crear zona |
| `PUT` | `/api/zonas/:id` | `/api/v1/zonas/:idZona` | JWT | — | Actualizar zona |
| `PATCH` | `/api/zonas/:id/estado` | `/api/v1/zonas/:idZona/estado` | JWT | — | Activar/desactivar |
| `DELETE` | `/api/zonas/:id` | `/api/v1/zonas/:idZona` | JWT | — | Eliminar zona |

### 🅿️ Espacios

Base: `http://zonas:8080/api/v1/espacios` — vía Kong: `/api/espacios`

| Método | Kong Path | Interno | Auth | Roles | Descripción |
|---|---|---|---|---|---|
| `GET` | `/api/espacios` | `/api/v1/espacios` | JWT | — | Listar espacios |
| `GET` | `/api/espacios/:id` | `/api/v1/espacios/:idEspacio` | JWT | — | Obtener espacio |
| `POST` | `/api/espacios` | `/api/v1/espacios` | JWT | — | Crear espacio |
| `PUT` | `/api/espacios/:id` | `/api/v1/espacios/:idEspacio` | JWT | — | Actualizar espacio |
| `DELETE` | `/api/espacios/:id` | `/api/v1/espacios/:idEspacio` | JWT | — | Eliminar (soft) |
| `PATCH` | `/api/espacios/:id/estado` | `/api/v1/espacios/:idEspacio/estado?estado=` | JWT | — | Cambiar estado |
| `GET` | `/api/espacios/estado/:estado` | `/api/v1/espacios/estado/:estado` | JWT | — | Filtrar por estado |
| `GET` | `/api/espacios/zona/:idZona/estado/:estado` | `/api/v1/espacios/zona/:idZona/estado/:estado` | JWT | — | Filtrar por zona + estado |

**Tipos de espacio:** `MOTO`, `AUTO`, `BUSETA`  
**Estados de espacio:** `DISPONIBLE`, `OCUPADO`, `INACTIVO`  
**Tipos de zona:** `VIP`, `REGULAR`

---

### 🔄 Asignaciones — `Reservas`

Base: `http://reservas_app:3002/asignaciones` — vía Kong: `/api/asignaciones`

| Método | Kong Path | Interno | Auth | Roles | Descripción |
|---|---|---|---|---|---|
| `POST` | `/api/asignaciones` | `/asignaciones` | JWT | admin | Asignar vehículo a propietario |
| `GET` | `/api/asignaciones` | `/asignaciones` | JWT | admin | Listar asignaciones |
| `GET` | `/api/asignaciones/propietario/:userId` | `/asignaciones/propietario/:userId` | JWT | self o admin | Flota de un propietario |
| `GET` | `/api/asignaciones/:userId/:vehicleId` | `/asignaciones/:userId/:vehicleId` | JWT | self o admin | Asignación específica |
| `DELETE` | `/api/asignaciones/:userId/:vehicleId` | `/asignaciones/:userId/:vehicleId` | JWT | admin, root | Eliminar asignación |

### 📜 Trazabilidad — `Reservas`

Base: `http://reservas_app:3002/trazabilidad` — vía Kong: `/api/trazabilidad`

| Método | Kong Path | Interno | Auth | Roles | Descripción |
|---|---|---|---|---|---|
| `GET` | `/api/trazabilidad` | `/trazabilidad` | JWT | admin | Todo el historial |
| `GET` | `/api/trazabilidad/asignacion/:userId/:vehicleId` | `/trazabilidad/asignacion/:userId/:vehicleId` | JWT | self o admin | Historial de una asignación |

---

### 🎫 Tickets

Base: `http://tickets_app:3004/tickets` — vía Kong: `/api/tickets`

| Método | Kong Path | Interno | Auth | Roles | Descripción |
|---|---|---|---|---|---|
| `POST` | `/api/tickets` | `/tickets` | JWT | recaudador, admin | Crear ticket |
| `GET` | `/api/tickets` | `/tickets` | JWT | admin, recaudador | Listar tickets |
| `GET` | `/api/tickets/:id` | `/tickets/:id` | JWT | self o admin/recaudador | Obtener ticket |
| `PATCH` | `/api/tickets/:id` | `/tickets/:id` | JWT | recaudador, admin | Actualizar ticket |
| `GET` | `/api/tickets/vehiculo/:idVehiculo` | `/tickets/vehiculo/:idVehiculo` | JWT | admin, recaudador | Tickets por vehículo |
| `POST` | `/api/tickets/:id/cobrar` | `/tickets/:id/cobrar` | JWT | recaudador, admin | Cobrar ticket |
| `POST` | `/api/tickets/:id/anular` | `/tickets/:id/anular` | JWT | recaudador, admin | Anular ticket |
| `DELETE` | `/api/tickets/:id` | `/tickets/:id` | JWT | admin, root | Eliminar ticket |

**POST /api/tickets**
```json
{
  "idEspacio": "uuid-del-espacio",
  "idUsuario": "uuid-del-usuario",
  "idVehiculo": "uuid-del-vehiculo",
  "fechaHoraIngreso": "2026-07-22T10:00:00Z",
  "idEmpleado": "uuid-del-recaudador"
}
```

**POST /api/tickets/:id/cobrar** — Query param opcional: `?fechaHoraSalida=2026-07-22T12:00:00Z`

**Tarifas por hora:**

| Tipo vehículo | $ / hora |
|---|---|
| Auto | $2.00 |
| Moto | $1.00 |
| Camioneta | $3.00 |
| Bus | $5.00 |
| Bicicleta | $0.50 |

---

### 📡 SSE (Server-Sent Events) — Tiempo Real

| Método | Kong Path | Interno | Auth | Descripción |
|---|---|---|---|---|
| `GET` | `/api/sse/espacios` | `/sse/espacios` | ❌ No | Stream en tiempo real de cambios en espacios |

El dashboard `dashboard_espacios/` consume este endpoint para mostrar el estado actualizado de todos los espacios sin recargar la página.

---

### 📋 Auditoría — `Ms-Audit`

Base: `http://ms_audit_app:3005/api/v1/audit` — vía Kong: `/api/audit`

| Método | Kong Path | Interno | Auth | Descripción |
|---|---|---|---|---|
| `POST` | `/api/audit` | `/audit` | ❌ No | Crear evento de auditoría |
| `GET` | `/api/audit` | `/audit` | ❌ No | Listar eventos |
| `GET` | `/api/audit/:id` | `/audit/:id` | ❌ No | Obtener evento |
| `PATCH` | `/api/audit/:id` | `/audit/:id` | ❌ No | Actualizar evento |
| `DELETE` | `/api/audit/:id` | `/audit/:id` | ❌ No | Eliminar evento |

> **Nota:** Este servicio no tiene autenticación — es interno para que los microservicios registren eventos.

Los microservicios `usuarios` y `vehiculos` publican eventos de auditoría a RabbitMQ (`audit_exchange` → `audit_queue`), y `ms-audit` los consume automáticamente.

---

### 📚 Documentación — `Docs Hub`

| Método | Path | Descripción |
|---|---|---|
| `GET` | `/api/docs` | Hub de documentación Swagger con tabs |
| `GET` | `/api/docs/usuarios` | Swagger UI — Usuarios |
| `GET` | `/api/docs/vehiculos` | Swagger UI — Vehículos |
| `GET` | `/api/docs/reservas` | Swagger UI — Reservas |
| `GET` | `/api/docs/tickets` | Swagger UI — Tickets |
| `GET` | `/api/swagger/zonas` | Swagger UI — Zonas |

---

## Roles del Sistema

| Rol | Permisos |
|---|---|
| `root` | Eliminación física (hard delete) en cualquier entidad |
| `admin` | CRUD completo en todos los módulos |
| `recaudador` | Crear, cobrar y anular tickets |
| `cliente` | Ver/editar perfil propio, ver sus vehículos asignados |

---

## Variables de Entorno

| Variable | Default | Descripción |
|---|---|---|
| `DB_USER` | — | Usuario PostgreSQL |
| `DB_PASSWORD` | — | Contraseña PostgreSQL |
| `DB_NAME` | — | Nombre base de datos principal |
| `JWT_SECRET` | `mi_clave_super_secreta_2024_para_jwt!` | Secreto JWT |
| `REFRESH_JWT_SECRET` | `mi_refresh_secret_2024_para_jwt!` | Secreto refresh token |
| `SERVICE_JWT_TOKEN` | (token pre-generado) | Token JWT para comunicación entre servicios |

---

## Frontend

El dashboard en tiempo real está en `dashboard_espacios/` — vanilla HTML + Tailwind CSS (CDN) + SSE.

No está containerizado. Para usarlo:

```bash
# Opción 1: Abrir directo
xdg-open dashboard_espacios/index.html

# Opción 2: Servir con Python
python3 -m http.server 8081 -d dashboard_espacios
# Luego abrir http://localhost:8081
```

> ⚠️ El dashboard espera Kong en `localhost:8000`. Si usás Docker, asegurate de que el frontend corra en el host (no dentro del contenedor).
