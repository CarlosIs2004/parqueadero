import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';

export interface IRolesService {
  create(createRoleDto: CreateRoleDto, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<Role>;
  findAll(): Promise<Role[]>;
  findOne(id: string): Promise<Role>;
  update(id: string, updateData: Partial<Role>, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<Role>;
  softDelete(id: string, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<void>;
  hardDelete(id: string, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<void>;
}
