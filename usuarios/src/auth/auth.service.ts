import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IUsersService } from '../users/interfaces/users-service.interface';
import type { IAuthService } from './interfaces/auth-service.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('IUsersService')
    private readonly usersService: IUsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.usersService.update(user.idPerson, {
      lastLogin: new Date(),
    });

    const payload = {
      sub: user.idPerson,
      username: user.username,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
