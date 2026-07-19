import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly httpService: HttpService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: string;
    username: string;
  }) {
    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido');
    }
    // Consultar roles actuales desde el servicio de usuarios
    const roles = await this.fetchUserRoles(payload.sub);
    return { idPerson: payload.sub, username: payload.username, roles: roles || [] };
  }

  private async fetchUserRoles(userId: string): Promise<string[]> {
    try {
      const usuariosUrl = process.env.USUARIOS_API_URL || 'http://usuarios_app:3001/users';
      const { data } = await firstValueFrom(
        this.httpService.get<string[]>(`${usuariosUrl}/${userId}/roles`),
      );
      return data;
    } catch (error: any) {
      this.logger.error(`Error consultando roles del usuario ${userId}: ${error?.message}`);
      throw new UnauthorizedException('No se pudieron verificar los roles del usuario');
    }
  }
}
