import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import type { IUsersService } from '../users/interfaces/users-service.interface';
import type { IAuthService } from './interfaces/auth-service.interface';
import { RegisterDto } from './dto/register.dto';
import { Person } from '../persons/entities/person.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../user-role/entities/user-role.entity';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('IUsersService')
    private readonly usersService: IUsersService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.usersService.update(user.idPerson, {
      lastLogin: new Date(),
    });

    const roles = await this.getUserRoles(user.idPerson);

    return this.generateTokens(user.idPerson, user.username, roles);
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const personRepo = queryRunner.manager.getRepository(Person);
      const userRepo = queryRunner.manager.getRepository(User);
      const roleRepo = queryRunner.manager.getRepository(Role);
      const userRoleRepo = queryRunner.manager.getRepository(UserRole);

      const existingUser = await userRepo.findOne({
        where: { username: dto.username, active: true },
      });
      if (existingUser) {
        throw new ConflictException('El nombre de usuario ya existe');
      }

      const existingPerson = await personRepo.findOne({
        where: [{ dni: dto.dni }, { email: dto.email }],
      });
      if (existingPerson?.active) {
        throw new ConflictException(
          'Ya existe una persona activa con ese DNI o email',
        );
      }

      const person = personRepo.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        dni: dto.dni,
        email: dto.email,
        phone: dto.phone,
        nationality: dto.nationality,
        address: dto.address,
      });
      const savedPerson = await personRepo.save(person);

      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(dto.password, salt);

      const user = userRepo.create({
        idPerson: savedPerson.id,
        username: dto.username,
        passwordHash,
      });
      await userRepo.save(user);

      let clienteRole = await roleRepo.findOne({
        where: { name: 'cliente' },
      });
      if (!clienteRole) {
        clienteRole = roleRepo.create({
          name: 'cliente',
          description: 'Cliente del parqueadero',
        });
        clienteRole = await roleRepo.save(clienteRole);
      }

      const userRole = userRoleRepo.create({
        idUser: savedPerson.id,
        idRole: clienteRole.id,
      });
      await userRoleRepo.save(userRole);

      await queryRunner.commitTransaction();

      return this.generateTokens(savedPerson.id, dto.username, ['cliente']);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_JWT_SECRET || 'default_refresh_secret',
      });

      const access_token = await this.jwtService.signAsync({
        sub: payload.sub,
        username: payload.username,
        roles: payload.roles,
      });

      return { access_token };
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  private async getUserRoles(idPerson: string): Promise<string[]> {
    const userRoleRepo = this.dataSource.getRepository(UserRole);
    const userRoles = await userRoleRepo.find({
      where: { idUser: idPerson, active: true },
      relations: { role: true },
    });
    return userRoles.map((ur) => ur.role.name);
  }

  private async generateTokens(
    sub: string,
    username: string,
    roles: string[],
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { sub, username, roles };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_JWT_SECRET || 'default_refresh_secret',
        expiresIn:
          (process.env.REFRESH_JWT_EXPIRES_IN ||
            '7d') as unknown as number,
      }),
    ]);

    return { access_token, refresh_token };
  }
}
