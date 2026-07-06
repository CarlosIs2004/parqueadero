import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Nombre', maxLength: 30 })
  @IsString()
  @MaxLength(30)
  @Matches(/^[A-Za-zÁáÉéÍíÓóÚúÑñÜü\s]+$/, {
    message: 'firstName solo debe contener letras',
  })
  firstName: string;

  @ApiProperty({ description: 'Apellido', maxLength: 30 })
  @IsString()
  @MaxLength(30)
  @Matches(/^[A-Za-zÁáÉéÍíÓóÚúÑñÜü\s]+$/, {
    message: 'lastName solo debe contener letras',
  })
  lastName: string;

  @ApiProperty({ description: 'Segundo nombre', maxLength: 30, required: false })
  @IsString()
  @MaxLength(30)
  @Matches(/^[A-Za-zÁáÉéÍíÓóÚúÑñÜü\s]*$/, {
    message: 'middleName solo debe contener letras',
  })
  middleName: string;

  @ApiProperty({ description: 'Cédula (10 dígitos)', example: '1234567890' })
  @IsString()
  @Length(10, 10, { message: 'dni debe tener exactamente 10 caracteres' })
  @Matches(/^\d+$/, { message: 'dni solo debe contener números' })
  dni: string;

  @ApiProperty({ description: 'Correo electrónico', example: 'correo@dominio.com' })
  @IsEmail({}, { message: 'email no es válido' })
  @MaxLength(50)
  email: string;

  @ApiProperty({ description: 'Teléfono', example: '0999123456' })
  @IsString()
  @MaxLength(15)
  @Matches(/^\d+$/, { message: 'phone solo debe contener números' })
  phone: string;

  @ApiProperty({ description: 'Nacionalidad', maxLength: 30 })
  @IsString()
  @MaxLength(30)
  @Matches(/^[A-Za-zÁáÉéÍíÓóÚúÑñÜü\s]+$/, {
    message: 'nationality solo debe contener letras',
  })
  nationality: string;

  @ApiProperty({ description: 'Dirección' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Nombre de usuario', minLength: 4, maxLength: 15 })
  @IsString()
  @MinLength(4)
  @MaxLength(15)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'username solo acepta letras, números y guión bajo',
  })
  username: string;

  @ApiProperty({ description: 'Contraseña', minLength: 11, maxLength: 60 })
  @IsString()
  @MinLength(11, { message: 'password debe tener al menos 11 caracteres' })
  @MaxLength(60)
  password: string;
}
