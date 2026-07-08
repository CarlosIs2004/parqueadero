import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, EstadoTicket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TARIFAS_POR_HORA } from './tarifas.constants';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
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

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      fechaHoraIngreso: new Date(createTicketDto.fechaHoraIngreso),
      fechaHoraSalida: createTicketDto.fechaHoraSalida
        ? new Date(createTicketDto.fechaHoraSalida)
        : undefined,
    });
    return this.ticketRepository.save(ticket);
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
      throw new BadRequestException('La fecha/hora de salida debe ser posterior a la de ingreso');
    }

    const diffHoras = Math.ceil(diffMs / (1000 * 60 * 60));
    const tarifa = TARIFAS_POR_HORA[ticket.tipoVehiculo] ?? 2.00;
    const valor = parseFloat((diffHoras * tarifa).toFixed(2));

    ticket.fechaHoraSalida = salida;
    ticket.estadoTicket = EstadoTicket.PAGADO;
    ticket.valorRecaudado = valor;

    return this.ticketRepository.save(ticket);
  }

  async anular(id: string): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (ticket.estadoTicket !== EstadoTicket.ACTIVO) {
      throw new BadRequestException(
        `Solo se pueden anular tickets en estado "activo". Estado actual: "${ticket.estadoTicket}"`,
      );
    }

    ticket.estadoTicket = EstadoTicket.ANULADO;
    return this.ticketRepository.save(ticket);
  }
}
