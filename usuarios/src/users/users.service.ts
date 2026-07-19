import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRole } from '../user-role/entities/user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { IUsersService } from './interfaces/users-service.interface';
import { EventPublisher } from '../common/event-publisher.service';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private eventPublisher: EventPublisher,
  ) {}

  async create(createUserDto: CreateUserDto, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    if (existing) {
      if (existing.active) {
        throw new ConflictException('Username already exists');
      }
      existing.username = createUserDto.username;
      existing.passwordHash = passwordHash;
      existing.active = true;
      existing.idPerson = createUserDto.idPerson;
      return this.usersRepository.save(existing);
    }

    const user = this.usersRepository.create({
      idPerson: createUserDto.idPerson,
      username: createUserDto.username,
      passwordHash,
    });

    const saved = await this.usersRepository.save(user);

    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'CREATE',
      entidad: 'USUARIO',
      usuario,
      rol,
      datos: { idPerson: createUserDto.idPerson, username: createUserDto.username },
      ip,
      mac,
    });

    return saved;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { idPerson: id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;
    if (!user.active) return null;
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async getUserRoles(idPerson: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { idUser: idPerson, active: true },
      relations: { role: true },
    });
    return userRoles.map((ur) => ur.role.name);
  }

  async update(id: string, updateData: Partial<User>, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<User> {
    const user = await this.findOne(id);
    if (updateData.username) {
      const existing = await this.usersRepository.findOne({
        where: { username: updateData.username },
      });
      if (existing && existing.idPerson !== id) {
        throw new ConflictException('Username already exists');
      }
    }
    Object.assign(user, updateData);
    const updated = await this.usersRepository.save(user);

    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'UPDATE',
      entidad: 'USUARIO',
      usuario,
      rol,
      datos: { username: user.username },
      ip,
      mac,
    });

    return updated;
  }

  async softDelete(id: string, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<void> {
    const user = await this.findOne(id);
    await this.update(id, { active: false });
    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'DELETE',
      entidad: 'USUARIO',
      usuario,
      rol,
      datos: { username: user.username },
      ip,
      mac,
    });
  }

  async hardDelete(id: string, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'DELETE',
      entidad: 'USUARIO',
      usuario,
      rol,
      datos: { username: user.username },
      ip,
      mac,
    });
  }
}
