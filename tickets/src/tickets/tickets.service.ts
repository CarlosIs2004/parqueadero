import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, EstadoTicket, TipoVehiculo } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ValidationService } from '../common/validation/validation.service';
import { TARIFAS_POR_HORA } from './tarifas.constants';
import { SseService } from '../sse/sse.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly validationService: ValidationService,
    private readonly sseService: SseService,
  ) {}

  private validarTransicion(actual: EstadoTicket, nuevo: EstadoTicket): void {
    const transicionesValidas: Record<EstadoTicket, EstadoTicket[]> = {
      [EstadoTicket.ACTIVO]: [EstadoTicket.PAGADO, EstadoTicket.ANULADO],
      [EstadoTicket.PAGADO]: [],
      [EstadoTicket.ANULADO]: [],
    };
    const permitidos = transicionesValidas[actual];
    if (!permitidos.includes(nuevo)) {
      throw new BadRequestException(
        `No se puede cambiar de "${actual}" a "${nuevo}". Transiciones válidas: activo → pagado | anulado`,
      );
    }
  }

  private mapTipoVehiculo(tipo: string): TipoVehiculo {
    const mapping: Record<string, TipoVehiculo> = {
      Auto: TipoVehiculo.AUTO,
      Motocicleta: TipoVehiculo.MOTO,
      Camioneta: TipoVehiculo.CAMIONETA,
    };
    return mapping[tipo] ?? TipoVehiculo.AUTO;
  }

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const [vehiculoData] = await Promise.all([
      this.validationService.fetchVehiculoData(createTicketDto.idVehiculo),
      this.validationService.validateEspacio(createTicketDto.idEspacio),
      this.validationService.validateUsuario(createTicketDto.idUsuario),
      this.validationService.validateUsuario(createTicketDto.idEmpleado),
    ]);
    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      tipoVehiculo: this.mapTipoVehiculo(vehiculoData.tipo),
      ccPlaca: vehiculoData.placa,
      fechaHoraIngreso: new Date(createTicketDto.fechaHoraIngreso),
      fechaHoraSalida: createTicketDto.fechaHoraSalida
        ? new Date(createTicketDto.fechaHoraSalida)
        : undefined,
    });
    const saved = await this.ticketRepository.save(ticket);
    this.sseService.emitEvent('espacio-ocupado', {
      idEspacio: saved.idEspacio,
      idTicket: saved.idTicket,
    });
    return saved;
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find();
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { idTicket: id },
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket con ID "${id}" no encontrado`);
    }
    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);
    await Promise.all([
      updateTicketDto.idEspacio
        ? this.validationService.validateEspacio(updateTicketDto.idEspacio)
        : Promise.resolve(),
      updateTicketDto.idUsuario
        ? this.validationService.validateUsuario(updateTicketDto.idUsuario)
        : Promise.resolve(),
      updateTicketDto.idVehiculo
        ? this.validationService.validateVehiculo(updateTicketDto.idVehiculo)
        : Promise.resolve(),
      updateTicketDto.idEmpleado
        ? this.validationService.validateUsuario(updateTicketDto.idEmpleado)
        : Promise.resolve(),
    ]);
    if (updateTicketDto.estadoTicket) {
      this.validarTransicion(ticket.estadoTicket, updateTicketDto.estadoTicket);
    }
    const updated = this.ticketRepository.merge(ticket, {
      ...updateTicketDto,
      fechaHoraIngreso: updateTicketDto.fechaHoraIngreso
        ? new Date(updateTicketDto.fechaHoraIngreso)
        : ticket.fechaHoraIngreso,
      fechaHoraSalida: updateTicketDto.fechaHoraSalida
        ? new Date(updateTicketDto.fechaHoraSalida)
        : ticket.fechaHoraSalida,
    });
    return this.ticketRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketRepository.remove(ticket);
  }

  async cobrar(id: string, fechaHoraSalida?: string): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (ticket.estadoTicket !== EstadoTicket.ACTIVO) {
      throw new BadRequestException(
        `Solo se pueden cobrar tickets en estado "activo". Estado actual: "${ticket.estadoTicket}"`,
      );
    }

    const salida = fechaHoraSalida ? new Date(fechaHoraSalida) : new Date();
    const ingreso = ticket.fechaHoraIngreso;
    const diffMs = salida.getTime() - ingreso.getTime();

    if (diffMs <= 0) {
      throw new BadRequestException(
        'La fecha/hora de salida debe ser posterior a la de ingreso',
      );
    }

    const diffHoras = Math.ceil(diffMs / (1000 * 60 * 60));
    const tarifa = TARIFAS_POR_HORA[ticket.tipoVehiculo] ?? 2.0;
    const valor = parseFloat((diffHoras * tarifa).toFixed(2));

    ticket.fechaHoraSalida = salida;
    ticket.estadoTicket = EstadoTicket.PAGADO;
    ticket.valorRecaudado = valor;

    const saved = await this.ticketRepository.save(ticket);
    this.sseService.emitEvent('espacio-disponible', {
      idEspacio: saved.idEspacio,
      idTicket: saved.idTicket,
    });
    return saved;
  }

  async anular(id: string): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (ticket.estadoTicket !== EstadoTicket.ACTIVO) {
      throw new BadRequestException(
        `Solo se pueden anular tickets en estado "activo". Estado actual: "${ticket.estadoTicket}"`,
      );
    }

    ticket.estadoTicket = EstadoTicket.ANULADO;
    const saved = await this.ticketRepository.save(ticket);
    this.sseService.emitEvent('espacio-disponible', {
      idEspacio: saved.idEspacio,
      idTicket: saved.idTicket,
    });
    return saved;
  }
}
