import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

export interface IUsersService {
  create(createUserDto: CreateUserDto, ip?: string, mac?: string): Promise<User>;
  findAll(): Promise<User[]>;
  findOne(id: string): Promise<User>;
  validateUser(username: string, password: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  update(id: string, updateData: Partial<User>, ip?: string, mac?: string): Promise<User>;
  softDelete(id: string, ip?: string, mac?: string): Promise<void>;
  hardDelete(id: string, ip?: string, mac?: string): Promise<void>;
}
