import { ApiProperty } from '@nestjs/swagger';

export class ResponseAsignacionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  vehicleId: string;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  assignedAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
