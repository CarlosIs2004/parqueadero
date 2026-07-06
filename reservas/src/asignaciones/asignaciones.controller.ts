import {
  Controller, Get, Post, Delete, Param, Body, UseGuards, Req, ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { AsignacionesService } from './asignaciones.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { ResponseAsignacionDto } from './dto/response-asignacion.dto';
import { FlotaResponseDto } from './dto/flota-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Asignaciones')
@ApiBearerAuth()
@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Asignar un vehículo a un propietario (admin)' })
  @ApiResponse({ status: 201, description: 'Asignación creada' })
  @ApiResponse({ status: 409, description: 'Vehículo ya asignado' })
  create(@Body() dto: CreateAsignacionDto): Promise<ResponseAsignacionDto> {
    return this.asignacionesService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Listar todas las asignaciones activas (admin)' })
  findAll(): Promise<ResponseAsignacionDto[]> {
    return this.asignacionesService.findAll();
  }

  @Get('propietario/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener flota de vehículos de un propietario (propio o admin)' })
  async getFlota(
    @Req() req: Request,
    @Param('userId') userId: string,
  ): Promise<FlotaResponseDto> {
    const user = req.user as { idPerson: string; roles: string[] };
    if (user.idPerson !== userId && !user.roles?.includes('admin')) {
      throw new ForbiddenException('No puedes ver los vehículos de otro usuario');
    }
    return this.asignacionesService.getFlotaByPropietario(userId);
  }

  @Get(':userId/:vehicleId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener una asignación específica (propia o admin)' })
  async findOne(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Param('vehicleId') vehicleId: string,
  ): Promise<ResponseAsignacionDto> {
    const user = req.user as { idPerson: string; roles: string[] };
    if (user.idPerson !== userId && !user.roles?.includes('admin')) {
      throw new ForbiddenException('No puedes ver asignaciones de otro usuario');
    }
    return this.asignacionesService.findOne(userId, vehicleId);
  }

  @Delete(':userId/:vehicleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'root')
  @ApiOperation({ summary: 'Eliminar una asignación (admin/root)' })
  @ApiResponse({ status: 204, description: 'Asignación eliminada' })
  async remove(
    @Param('userId') userId: string,
    @Param('vehicleId') vehicleId: string,
  ): Promise<void> {
    await this.asignacionesService.remove(userId, vehicleId);
  }
}
