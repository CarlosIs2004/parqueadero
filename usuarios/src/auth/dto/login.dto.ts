import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Nombre de usuario' })
  @IsString()
  @MinLength(4)
  @MaxLength(15)
  username: string;

  @ApiProperty({ description: 'Contraseña' })
  @IsString()
  @MinLength(11)
  @MaxLength(255)
  password: string;

  @ApiPropertyOptional({ description: 'Dirección MAC del cliente', example: '00:1A:2B:3C:4D:5E' })
  @IsOptional()
  @IsString()
  mac?: string;
}
