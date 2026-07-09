import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ValidationService } from '../common/validation/validation.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly validationService: ValidationService,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    await Promise.all([
      this.validationService.validateEspacio(createTicketDto.idEspacio),
      this.validationService.validateUsuario(createTicketDto.idUsuario),
      this.validationService.validateVehiculo(createTicketDto.idVehiculo),
      this.validationService.validateUsuario(createTicketDto.idEmpleado),
    ]);
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
}
