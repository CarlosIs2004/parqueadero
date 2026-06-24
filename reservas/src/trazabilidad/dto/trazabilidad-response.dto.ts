import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrazabilidadResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-4466554400aa' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  vehicleId: string;

  @ApiProperty({ enum: ['CREACION', 'MODIFICACION', 'ELIMINACION'] })
  accion: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: Date;

  @ApiPropertyOptional()
  oldState?: Record<string, unknown>;

  @ApiPropertyOptional()
  newState?: Record<string, unknown>;
}
