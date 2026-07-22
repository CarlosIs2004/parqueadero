// Auth
export interface LoginPayload {
  username: string
  password: string
  mac?: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  middleName?: string
  dni: string
  email: string
  phone: string
  nationality: string
  address: string
  username: string
  password: string
  mac?: string
}

export interface Tokens {
  access_token: string
  refresh_token: string
}

// User — response from backend
export interface User {
  idPerson: string
  username: string
  active: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface UserRole {
  idUser: string
  idRole: string
  user?: User
  role?: Role
}

export interface Person {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  dni: string
  email: string
  phone: string
  nationality: string
  address: string
  active: boolean
  user?: User
  createdAt: string
  updatedAt: string
}

// Vehicle
export type VehicleType = "auto" | "moto" | "camioneta"
export type Clasificacion = "Gasolina" | "Diesel" | "Electrico" | "Hibrido"
export type TipoMoto = "Deportivo" | "Scooter" | "Motocross"
export type Cabina = "Simple" | "Doble"

export interface VehicleBase {
  placa: string
  marca: string
  modelo: string
  color: string
  anio: number
  clasificacion: Clasificacion
}

export interface Auto extends VehicleBase {
  numeroPuertas: number
  capacidadMaletero: number
}

export interface Moto extends VehicleBase {
  placa: string
  tipoMoto: TipoMoto
}

export interface Camioneta extends VehicleBase {
  cabina: Cabina
  capacidadCarga: number
}

export interface CreateVehiculoPayload {
  tipo: VehicleType
  datos: Auto | Moto | Camioneta
}

// Response from vehicles endpoint
export interface Vehicle {
  id: string
  placa: string
  marca: string
  modelo: string
  color: string
  anio: number
  tipo: string
  clasificacion?: string
  numeroPuertas?: number
  capacidadMaletero?: number
  tipoMoto?: string
  cabina?: string
  capacidadCarga?: number
}

// Zone & Space — Spring Boot DTOs
export type TipoEspacio = "MOTO" | "AUTO" | "BUSETA"
export type EstadoEspacio = "DISPONIBLE" | "OCUPADO" | "INACTIVO"
export type TipoZona = "VIP" | "REGULAR"

export interface Zona {
  idZona: string
  codigo: string
  nombre: string
  descripcion?: string
  tipo: TipoZona
  capacidad: number
  estado: number
  activo?: boolean
  espacios?: Espacio[]
  fechaCreacion?: string
  fechaModificacion?: string
}

export interface ZonaPayload {
  nombre: string
  descripcion?: string
  tipo: TipoZona
  capacidad: number
}

export interface Espacio {
  id: string
  codigo: string
  descripcion?: string
  tipo: TipoEspacio
  estado: EstadoEspacio
  activo: boolean
  idZona: string
  nombreZona?: string
  fechaCreacion?: string
  fechaModificacion?: string
}

export interface EspacioPayload {
  codigo?: string
  idZona: string
  descripcion?: string
  tipo: TipoEspacio
  estado?: EstadoEspacio
}

// Assignment
export interface Asignacion {
  userId: string
  vehicleId: string
  active: boolean
  fechaAsignacion?: string
  assignedAt?: string
  updatedAt?: string
  user?: { username: string }
  vehicle?: { placa: string }
}

// Ticket — lowercase enum values
export type EstadoTicket = "activo" | "pagado" | "anulado"

export interface Ticket {
  id: string
  idEspacio: string
  idUsuario: string
  idVehiculo: string
  fechaHoraIngreso: string
  fechaHoraSalida?: string
  idEmpleado?: string
  estadoTicket?: EstadoTicket
  valorRecaudado?: number
  total?: number
  espacio?: Espacio
  vehiculo?: Vehicle
}

export interface CreateTicketPayload {
  idEspacio: string
  idUsuario: string
  idVehiculo: string
  fechaHoraIngreso: string
  idEmpleado: string
  fechaHoraSalida?: string
  valorRecaudado?: number
}

// Audit
export interface AuditEvent {
  id: string
  servicio: string
  accion: string
  entidad: string
  usuario?: string
  ip: string
  datos?: Record<string, unknown>
  fecha?: string
  createdAt?: string
}
