import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiExtraModels, ApiBearerAuth } from '@nestjs/swagger';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto, AutoDto, MotoDto, CamionetaDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { ResponseVehiculoDto } from './dto/response.vehiculo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Vehículos')
@ApiExtraModels(AutoDto, MotoDto, CamionetaDto)
@ApiBearerAuth()
@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Crear un vehículo (admin)' })
  @ApiResponse({ status: 201, description: 'Vehículo creado exitosamente', type: ResponseVehiculoDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'La placa ya existe' })
  create(@Body() createVehiculoDto: CreateVehiculoDto) {
    return this.vehiculosService.create(createVehiculoDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar vehículos (autenticado)' })
  @ApiQuery({ name: 'tipo', required: false, enum: ['auto', 'moto', 'camioneta'], description: 'Filtrar por tipo de vehículo' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos', type: [ResponseVehiculoDto] })
  findAll(@Query('tipo') tipo?: string) {
    return this.vehiculosService.findAll(tipo);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener un vehículo por ID (autenticado)' })
  @ApiParam({ name: 'id', description: 'UUID del vehículo', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Vehículo encontrado', type: ResponseVehiculoDto })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.vehiculosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar parcialmente un vehículo (admin)' })
  @ApiParam({ name: 'id', description: 'UUID del vehículo', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Vehículo actualizado', type: ResponseVehiculoDto })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  update(@Param('id') id: string, @Body() updateVehiculoDto: UpdateVehiculoDto) {
    return this.vehiculosService.update(id, updateVehiculoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'root')
  @ApiOperation({ summary: 'Eliminar un vehículo (admin/root)' })
  @ApiParam({ name: 'id', description: 'UUID del vehículo', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Vehículo eliminado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  remove(@Param('id') id: string) {
    return this.vehiculosService.remove(id);
  }
}
