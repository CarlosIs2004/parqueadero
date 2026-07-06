import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

export interface IUsersService {
  create(createUserDto: CreateUserDto): Promise<User>;
  findAll(): Promise<User[]>;
  findOne(id: string): Promise<User>;
  validateUser(username: string, password: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  update(id: string, updateData: Partial<User>): Promise<User>;
  softDelete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
}
