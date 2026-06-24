import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Asignacion } from './entities/asignacion.entity';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { ResponseAsignacionDto } from './dto/response-asignacion.dto';
import { FlotaResponseDto, VehiculoInfoDto } from './dto/flota-response.dto';
import { AsignacionCreatedEvent, AsignacionRemovedEvent } from '../common/events/asignacion.events';
import { VehiculosClientService } from '../common/services/vehiculos-client.service';

@Injectable()
export class AsignacionesService {
  constructor(
    @InjectRepository(Asignacion)
    private readonly asignacionRepository: Repository<Asignacion>,
    private readonly eventEmitter: EventEmitter2,
    private readonly vehiculosClient: VehiculosClientService,
  ) {}

  async create(dto: CreateAsignacionDto): Promise<ResponseAsignacionDto> {
    const existing = await this.asignacionRepository.findOne({
      where: { vehicleId: dto.vehicleId, active: true },
    });

    if (existing) {
      throw new ConflictException(
        `El vehículo ${dto.vehicleId} ya está asignado a otro propietario`,
      );
    }

    const asignacion = this.asignacionRepository.create({
      userId: dto.userId,
      vehicleId: dto.vehicleId,
      active: true,
    });

    const saved = await this.asignacionRepository.save(asignacion);

    this.eventEmitter.emit(
      'asignacion.created',
      new AsignacionCreatedEvent(saved.userId, saved.vehicleId, {
        userId: saved.userId,
        vehicleId: saved.vehicleId,
        active: saved.active,
        assignedAt: saved.assignedAt.toISOString(),
      }),
    );

    return saved;
  }

  async findAll(): Promise<ResponseAsignacionDto[]> {
    return this.asignacionRepository.find({ where: { active: true } });
  }

  async findOne(userId: string, vehicleId: string): Promise<ResponseAsignacionDto> {
    const asignacion = await this.asignacionRepository.findOne({
      where: { userId, vehicleId },
    });
    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }
    return asignacion;
  }

  async remove(userId: string, vehicleId: string): Promise<void> {
    const asignacion = await this.findOne(userId, vehicleId);
    const oldState = {
      userId: asignacion.userId,
      vehicleId: asignacion.vehicleId,
      active: asignacion.active,
      assignedAt: asignacion.assignedAt.toISOString(),
    };

    await this.asignacionRepository.delete({ userId, vehicleId });

    this.eventEmitter.emit(
      'asignacion.removed',
      new AsignacionRemovedEvent(userId, vehicleId, oldState),
    );
  }

  async getFlotaByPropietario(userId: string): Promise<FlotaResponseDto> {
    const asignaciones = await this.asignacionRepository.find({
      where: { userId, active: true },
    });

    const vehiculos: VehiculoInfoDto[] = [];

    for (const asignacion of asignaciones) {
      const vehiculo = await this.vehiculosClient.getVehiculo(asignacion.vehicleId);
      if (vehiculo) {
        vehiculos.push(vehiculo as unknown as VehiculoInfoDto);
      }
    }

    return {
      userId,
      vehiculos,
    };
  }
}
