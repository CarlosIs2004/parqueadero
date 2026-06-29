import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
