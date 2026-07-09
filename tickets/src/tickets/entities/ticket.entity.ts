import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum EstadoTicket {
  ACTIVO = 'activo',
  PAGADO = 'pagado',
  ANULADO = 'anulado',
}

@Entity('tickets')
export class Ticket {
  @ApiProperty({ description: 'ID único del ticket' })
  @PrimaryGeneratedColumn('uuid')
  idTicket: string;

  @ApiProperty({ description: 'ID del espacio asignado' })
  @Column({ name: 'id_espacio', type: 'varchar', length: 50 })
  idEspacio: string;

  @ApiProperty({ description: 'ID del usuario (cédula/RUC)' })
  @Column({ name: 'id_usuario', type: 'varchar', length: 50 })
  idUsuario: string;

  @ApiProperty({ description: 'ID del vehículo' })
  @Column({ name: 'id_vehiculo', type: 'varchar', length: 50 })
  idVehiculo: string;

  @ApiProperty({
    description: 'Cédula y/o placa del vehículo',
    required: false,
  })
  @Column({ name: 'cc_placa', type: 'varchar', length: 20, nullable: true })
  ccPlaca: string;

  @ApiProperty({ description: 'Fecha y hora de ingreso' })
  @Column({ name: 'fecha_hora_ingreso', type: 'timestamp' })
  fechaHoraIngreso: Date;

  @ApiProperty({ description: 'Fecha y hora de salida', required: false })
  @Column({ name: 'fecha_hora_salida', type: 'timestamp', nullable: true })
  fechaHoraSalida: Date;

  @ApiProperty({ description: 'Estado del ticket', enum: EstadoTicket })
  @Column({
    name: 'estado_ticket',
    type: 'enum',
    enum: EstadoTicket,
    default: EstadoTicket.ACTIVO,
  })
  estadoTicket: EstadoTicket;

  @ApiProperty({ description: 'ID del empleado que registró (sesión)' })
  @Column({ name: 'id_empleado', type: 'varchar', length: 50 })
  idEmpleado: string;

  @ApiProperty({
    description: 'Valor recaudado (según tipo vehículo y tipo espacio)',
    required: false,
  })
  @Column({
    name: 'valor_recaudado',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  valorRecaudado: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
