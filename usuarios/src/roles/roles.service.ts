import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { IRolesService } from './interfaces/roles-service.interface';
import { EventPublisher } from '../common/event-publisher.service';

@Injectable()
export class RolesService implements IRolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private eventPublisher: EventPublisher,
  ) {}

  async create(createRoleDto: CreateRoleDto, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<Role> {
    const existing = await this.rolesRepository.findOne({
      where: { name: createRoleDto.name },
    });
    if (existing) {
      throw new ConflictException(
        `Role with name "${createRoleDto.name}" already exists`,
      );
    }
    const role = this.rolesRepository.create(createRoleDto);
    const saved = await this.rolesRepository.save(role);
    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'CREATE',
      entidad: 'ROL',
      usuario,
      rol,
      datos: { name: createRoleDto.name },
      ip,
      mac,
    });
    return saved;
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }

  async update(id: string, updateData: Partial<Role>, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<Role> {
    if (updateData.name) {
      const existing = await this.rolesRepository.findOne({
        where: { name: updateData.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Role with name "${updateData.name}" already exists`,
        );
      }
    }
    const role = await this.findOne(id);
    Object.assign(role, updateData);
    const updated = await this.rolesRepository.save(role);
    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'UPDATE',
      entidad: 'ROL',
      usuario,
      rol,
      datos: { name: updateData.name },
      ip,
      mac,
    });
    return updated;
  }

  async softDelete(id: string, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<void> {
    const role = await this.findOne(id);
    await this.update(id, { active: false });
    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'DELETE',
      entidad: 'ROL',
      usuario,
      rol,
      datos: { name: role.name },
      ip,
      mac,
    });
  }

  async hardDelete(id: string, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepository.remove(role);
    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'DELETE',
      entidad: 'ROL',
      usuario,
      rol,
      datos: { name: role.name },
      ip,
      mac,
    });
  }
}
