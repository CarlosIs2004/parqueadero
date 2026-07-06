import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener tokens JWT' })
  @ApiResponse({
    status: 201,
    description: 'Login exitoso, retorna access_token y refresh_token',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIs...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIs...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrarse como cliente' })
  @ApiResponse({
    status: 201,
    description: 'Registro exitoso, retorna access_token y refresh_token',
  })
  @ApiResponse({ status: 409, description: 'Conflicto: datos duplicados' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar access_token usando refresh_token' })
  @ApiResponse({
    status: 201,
    description: 'Nuevo access_token generado',
    schema: {
      example: { access_token: 'eyJhbGciOiJIUzI1NiIs...' },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }
}
