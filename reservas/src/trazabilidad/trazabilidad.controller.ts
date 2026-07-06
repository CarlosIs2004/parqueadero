import { Controller, Get, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { TrazabilidadService } from './trazabilidad.service';
import { TrazabilidadResponseDto } from './dto/trazabilidad-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Trazabilidad')
@ApiBearerAuth()
@Controller('trazabilidad')
export class TrazabilidadController {
  constructor(private readonly trazabilidadService: TrazabilidadService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Listar todos los eventos de trazabilidad (admin)' })
  findAll(): Promise<TrazabilidadResponseDto[]> {
    return this.trazabilidadService.findAll();
  }

  @Get('asignacion/:userId/:vehicleId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener trazabilidad de una asignación (propia o admin)' })
  async findByAsignacion(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Param('vehicleId') vehicleId: string,
  ): Promise<TrazabilidadResponseDto[]> {
    const user = req.user as { idPerson: string; roles: string[] };
    if (user.idPerson !== userId && !user.roles?.includes('admin')) {
      throw new ForbiddenException('No puedes ver trazabilidad de otro usuario');
    }
    return this.trazabilidadService.findByAsignacion(userId, vehicleId);
  }
}
