import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo ticket' })
  @ApiResponse({
    status: 201,
    description: 'Ticket creado exitosamente',
    type: Ticket,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los tickets' })
  @ApiResponse({ status: 200, description: 'Lista de tickets', type: [Ticket] })
  findAll(): Promise<Ticket[]> {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un ticket por ID' })
  @ApiResponse({ status: 200, description: 'Ticket encontrado', type: Ticket })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Ticket> {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un ticket' })
  @ApiResponse({ status: 200, description: 'Ticket actualizado', type: Ticket })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ): Promise<Ticket> {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un ticket' })
  @ApiResponse({ status: 204, description: 'Ticket eliminado' })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.ticketsService.remove(id);
  }
}
