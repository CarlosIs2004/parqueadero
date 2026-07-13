import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { toLowerTrim } from '../../common/transforms';

export class CreateRoleDto {
  @ApiProperty({ description: 'Nombre del rol', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  @toLowerTrim
  name: string;

  @ApiProperty({ description: 'Descripción del rol', required: false })
  @IsOptional()
  @IsString()
  @toLowerTrim
  description?: string;

  @ApiProperty({
    description: 'Estado del rol',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Dirección MAC del cliente', example: '00:1A:2B:3C:4D:5E' })
  @IsOptional()
  @IsString()
  mac?: string;
}
