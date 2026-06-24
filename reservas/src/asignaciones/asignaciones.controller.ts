import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AsignacionesService } from './asignaciones.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { ResponseAsignacionDto } from './dto/response-asignacion.dto';
import { FlotaResponseDto } from './dto/flota-response.dto';

@ApiTags('Asignaciones')
@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  @Post()
  @ApiOperation({ summary: 'Asignar un vehículo a un propietario' })
  @ApiResponse({ status: 201, description: 'Asignación creada' })
  @ApiResponse({ status: 409, description: 'Vehículo ya asignado' })
  create(@Body() dto: CreateAsignacionDto): Promise<ResponseAsignacionDto> {
    return this.asignacionesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las asignaciones activas' })
  findAll(): Promise<ResponseAsignacionDto[]> {
    return this.asignacionesService.findAll();
  }

  @Get('propietario/:userId')
  @ApiOperation({ summary: 'Obtener flota de vehículos de un propietario' })
  getFlota(@Param('userId') userId: string): Promise<FlotaResponseDto> {
    return this.asignacionesService.getFlotaByPropietario(userId);
  }

  @Get(':userId/:vehicleId')
  @ApiOperation({ summary: 'Obtener una asignación específica' })
  findOne(
    @Param('userId') userId: string,
    @Param('vehicleId') vehicleId: string,
  ): Promise<ResponseAsignacionDto> {
    return this.asignacionesService.findOne(userId, vehicleId);
  }

  @Delete(':userId/:vehicleId')
  @ApiOperation({ summary: 'Eliminar una asignación' })
  @ApiResponse({ status: 204, description: 'Asignación eliminada' })
  async remove(
    @Param('userId') userId: string,
    @Param('vehicleId') vehicleId: string,
  ): Promise<void> {
    await this.asignacionesService.remove(userId, vehicleId);
  }
}
