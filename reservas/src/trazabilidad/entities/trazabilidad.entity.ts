import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum AccionTrazabilidad {
  CREACION = 'CREACION',
  MODIFICACION = 'MODIFICACION',
  ELIMINACION = 'ELIMINACION',
}

@Entity('trazabilidad')
export class Trazabilidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;

  @Column({ name: 'accion', type: 'enum', enum: AccionTrazabilidad })
  accion: AccionTrazabilidad;

  @Column({ name: 'timestamp', type: 'timestamptz' })
  timestamp: Date;

  @Column({ name: 'old_state', type: 'jsonb', nullable: true })
  oldState?: Record<string, unknown>;

  @Column({ name: 'new_state', type: 'jsonb', nullable: true })
  newState?: Record<string, unknown>;
}
