import { UserRole } from '../entities/user-role.entity';
import { AssignRoleDto } from '../dto/assign-role.dto';

export interface IUserRoleService {
  assignRole(assignRoleDto: AssignRoleDto, ip?: string, mac?: string): Promise<UserRole>;
  removeRole(idUser: string, idRole: string, ip?: string, mac?: string): Promise<void>;
  findRolesByUser(idUser: string): Promise<UserRole[]>;
  findUsersByRole(idRole: string): Promise<UserRole[]>;
  hardDelete(idUser: string, idRole: string, ip?: string, mac?: string): Promise<void>;
}
