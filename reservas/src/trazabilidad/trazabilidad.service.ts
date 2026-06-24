import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trazabilidad, AccionTrazabilidad } from './entities/trazabilidad.entity';
import { TrazabilidadResponseDto } from './dto/trazabilidad-response.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { AsignacionCreatedEvent, AsignacionRemovedEvent } from '../common/events/asignacion.events';

@Injectable()
export class TrazabilidadService {
  constructor(
    @InjectRepository(Trazabilidad)
    private readonly trazabilidadRepository: Repository<Trazabilidad>,
  ) {}

  async findAll(): Promise<TrazabilidadResponseDto[]> {
    return this.trazabilidadRepository.find({ order: { timestamp: 'DESC' } });
  }

  async findByAsignacion(userId: string, vehicleId: string): Promise<TrazabilidadResponseDto[]> {
    return this.trazabilidadRepository.find({
      where: { userId, vehicleId },
      order: { timestamp: 'DESC' },
    });
  }

  @OnEvent('asignacion.created')
  async handleAsignacionCreated(event: AsignacionCreatedEvent): Promise<void> {
    const record = this.trazabilidadRepository.create({
      userId: event.userId,
      vehicleId: event.vehicleId,
      accion: AccionTrazabilidad.CREACION,
      timestamp: new Date(),
      newState: event.newState,
    });
    await this.trazabilidadRepository.save(record);
  }

  @OnEvent('asignacion.removed')
  async handleAsignacionRemoved(event: AsignacionRemovedEvent): Promise<void> {
    const record = this.trazabilidadRepository.create({
      userId: event.userId,
      vehicleId: event.vehicleId,
      accion: AccionTrazabilidad.ELIMINACION,
      timestamp: new Date(),
      oldState: event.oldState,
    });
    await this.trazabilidadRepository.save(record);
  }
}
