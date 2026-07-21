import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Req,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recaudador', 'admin')
  @ApiOperation({ summary: 'Crear un nuevo ticket (recaudador/admin)' })
  @ApiResponse({ status: 201, description: 'Ticket creado exitosamente', type: Ticket })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'recaudador')
  @ApiOperation({ summary: 'Obtener todos los tickets (admin/recaudador)' })
  @ApiResponse({ status: 200, description: 'Lista de tickets', type: [Ticket] })
  findAll(): Promise<Ticket[]> {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener un ticket por ID (propio o admin/recaudador)' })
  @ApiResponse({ status: 200, description: 'Ticket encontrado', type: Ticket })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  async findOne(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Ticket> {
    const user = req.user as { idPerson: string; roles: string[] };
    const ticket = await this.ticketsService.findOne(id);
    if (!ticket) {
      return null as any;
    }
    const isRecaudadorOrAdmin = user.roles?.some(r => ['admin', 'recaudador', 'root'].includes(r));
    const isOwner = ticket.idUsuario === user.idPerson;
    if (!isRecaudadorOrAdmin && !isOwner) {
      throw new ForbiddenException('No puedes ver tickets de otro usuario');
    }
    return ticket;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recaudador', 'admin')
  @ApiOperation({ summary: 'Actualizar un ticket (recaudador/admin)' })
  @ApiResponse({ status: 200, description: 'Ticket actualizado', type: Ticket })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ): Promise<Ticket> {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Get('vehiculo/:idVehiculo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'recaudador')
  @ApiOperation({ summary: 'Obtener tickets por vehículo (admin/recaudador)' })
  @ApiResponse({ status: 200, description: 'Lista de tickets del vehículo', type: [Ticket] })
  findByVehiculo(@Param('idVehiculo', ParseUUIDPipe) idVehiculo: string): Promise<Ticket[]> {
    return this.ticketsService.findByVehiculo(idVehiculo);
  }

  @Post(':id/cobrar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recaudador', 'admin')
  @ApiOperation({ summary: 'Cobrar ticket: calcula valor según horas y tarifa, marca como pagado (recaudador/admin)' })
  @ApiResponse({ status: 200, description: 'Ticket cobrado exitosamente' })
  @ApiResponse({ status: 400, description: 'El ticket no está activo o fecha inválida' })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  async cobrar(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('fechaHoraSalida') fechaHoraSalida?: string,
  ): Promise<Ticket> {
    return this.ticketsService.cobrar(id, fechaHoraSalida || undefined);
  }

  @Post(':id/anular')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recaudador', 'admin')
  @ApiOperation({ summary: 'Anular ticket (recaudador/admin)' })
  @ApiResponse({ status: 200, description: 'Ticket anulado exitosamente' })
  @ApiResponse({ status: 400, description: 'El ticket no está activo' })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  async anular(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Ticket> {
    return this.ticketsService.anular(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'root')
  @ApiOperation({ summary: 'Eliminar un ticket (admin/root)' })
  @ApiResponse({ status: 204, description: 'Ticket eliminado' })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.ticketsService.remove(id);
  }
}
