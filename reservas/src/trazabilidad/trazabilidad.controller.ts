import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TrazabilidadService } from './trazabilidad.service';
import { TrazabilidadResponseDto } from './dto/trazabilidad-response.dto';

@ApiTags('Trazabilidad')
@Controller('trazabilidad')
export class TrazabilidadController {
  constructor(private readonly trazabilidadService: TrazabilidadService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los eventos de trazabilidad' })
  findAll(): Promise<TrazabilidadResponseDto[]> {
    return this.trazabilidadService.findAll();
  }

  @Get('asignacion/:userId/:vehicleId')
  @ApiOperation({ summary: 'Obtener trazabilidad de una asignación específica' })
  findByAsignacion(
    @Param('userId') userId: string,
    @Param('vehicleId') vehicleId: string,
  ): Promise<TrazabilidadResponseDto[]> {
    return this.trazabilidadService.findByAsignacion(userId, vehicleId);
  }
}
