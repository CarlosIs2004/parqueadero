import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { AssignRoleDto } from './dto/assign-role.dto';
import { IUserRoleService } from './interfaces/user-role-service.interface';
import { EventPublisher } from '../common/event-publisher.service';

@Injectable()
export class UserRoleService implements IUserRoleService {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private eventPublisher: EventPublisher,
  ) {}

  async assignRole(assignRoleDto: AssignRoleDto, ip?: string, mac?: string): Promise<UserRole> {
    const existing = await this.userRoleRepository.findOne({
      where: {
        idUser: assignRoleDto.idUser,
        idRole: assignRoleDto.idRole,
      },
    });

    if (existing) {
      if (existing.active) {
        throw new ConflictException('User already has this role assigned');
      }
      existing.active = true;
      const saved = await this.userRoleRepository.save(existing);
      this.eventPublisher.publish({
        servicio: 'ms-usuarios',
        accion: 'CREATE',
        entidad: 'ROL-USUARIOS',
        datos: { idUser: assignRoleDto.idUser, idRole: assignRoleDto.idRole },
        ip,
        mac,
      });
      return saved;
    }

    const userRole = this.userRoleRepository.create({
      idUser: assignRoleDto.idUser,
      idRole: assignRoleDto.idRole,
    });

    const saved = await this.userRoleRepository.save(userRole);
    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'CREATE',
      entidad: 'ROL-USUARIOS',
      datos: { idUser: assignRoleDto.idUser, idRole: assignRoleDto.idRole },
      ip,
      mac,
    });
    return saved;
  }

  async removeRole(idUser: string, idRole: string, ip?: string, mac?: string): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { idUser, idRole, active: true },
    });

    if (!userRole) {
      throw new NotFoundException('Role assignment not found');
    }

    userRole.active = false;
    await this.userRoleRepository.save(userRole);
    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'DELETE',
      entidad: 'ROL-USUARIOS',
      datos: { idUser, idRole },
      ip,
      mac,
    });
  }

  async findRolesByUser(idUser: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { idUser, active: true },
      relations: { role: true },
    });
  }

  async findUsersByRole(idRole: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { idRole, active: true },
      relations: { user: true },
    });
  }

  async hardDelete(idUser: string, idRole: string, ip?: string, mac?: string): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { idUser, idRole },
    });
    if (!userRole) {
      throw new NotFoundException('Role assignment not found');
    }
    await this.userRoleRepository.remove(userRole);
    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'DELETE',
      entidad: 'ROL-USUARIOS',
      datos: { idUser, idRole },
      ip,
      mac,
    });
  }
}
