import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { EstadoTicket } from '../entities/ticket.entity';

export class CreateTicketDto {
  @ApiProperty({ description: 'ID del espacio asignado' })
  @IsString()
  @IsNotEmpty()
  idEspacio: string;

  @ApiProperty({ description: 'ID del usuario (cédula/RUC)' })
  @IsString()
  @IsNotEmpty()
  idUsuario: string;

  @ApiProperty({ description: 'ID del vehículo' })
  @IsString()
  @IsNotEmpty()
  idVehiculo: string;

  @ApiPropertyOptional({ description: 'Cédula y/o placa del vehículo' })
  @IsString()
  @IsOptional()
  ccPlaca?: string;

  @ApiProperty({ description: 'Fecha y hora de ingreso' })
  @IsDateString()
  @IsNotEmpty()
  fechaHoraIngreso: string;

  @ApiPropertyOptional({ description: 'Fecha y hora de salida' })
  @IsDateString()
  @IsOptional()
  fechaHoraSalida?: string;

  @ApiPropertyOptional({
    description: 'Estado del ticket',
    enum: EstadoTicket,
    default: EstadoTicket.ACTIVO,
  })
  @IsEnum(EstadoTicket)
  @IsOptional()
  estadoTicket?: EstadoTicket;

  @ApiProperty({ description: 'ID del empleado que registró (sesión)' })
  @IsString()
  @IsNotEmpty()
  idEmpleado: string;

  @ApiPropertyOptional({ description: 'Valor recaudado' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  valorRecaudado?: number;
}
