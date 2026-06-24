import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VehiculoInfoDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id: string;

  @ApiProperty({ example: 'ABC-1234' })
  placa: string;

  @ApiProperty({ example: 'Toyota' })
  marca: string;

  @ApiProperty({ example: 'Corolla' })
  modelo: string;

  @ApiProperty({ example: 'Rojo' })
  color: string;

  @ApiProperty({ example: 2024 })
  anio: number;

  @ApiProperty({ example: 'Auto' })
  tipo: string;

  @ApiProperty({ example: 'Gasolina' })
  clasificacion: string;

  @ApiPropertyOptional({ example: 4 })
  numeroPuertas?: number;

  @ApiPropertyOptional({ example: 470 })
  capacidadMaletero?: number;

  @ApiPropertyOptional({ example: 'Deportivo' })
  tipoMoto?: string;

  @ApiPropertyOptional({ example: 'Simple' })
  cabina?: string;

  @ApiPropertyOptional({ example: 1500 })
  capacidadCarga?: number;
}

export class FlotaResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiProperty({ type: [VehiculoInfoDto] })
  vehiculos: VehiculoInfoDto[];
}
