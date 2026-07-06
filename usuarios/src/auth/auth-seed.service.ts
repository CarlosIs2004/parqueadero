import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Person } from '../persons/entities/person.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../user-role/entities/user-role.entity';

@Injectable()
export class AuthSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthSeedService.name);

  constructor(
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.seedRoles();
      await this.seedAdmin();
    } catch (error) {
      this.logger.error('Error en seed:', error);
    }
  }

  private async seedRoles() {
    const roleRepo = this.dataSource.getRepository(Role);
    const defaultRoles = [
      { name: 'cliente', description: 'Cliente del parqueadero' },
      { name: 'admin', description: 'Administrador del sistema' },
      { name: 'recaudador', description: 'Recaudador - emite y cobra tickets' },
      { name: 'root', description: 'Super usuario - eliminaciones físicas' },
    ];

    for (const roleData of defaultRoles) {
      const exists = await roleRepo.findOne({
        where: { name: roleData.name },
      });
      if (!exists) {
        const role = roleRepo.create(roleData);
        await roleRepo.save(role);
        this.logger.log(`Rol "${roleData.name}" creado`);
      }
    }
  }

  private async seedAdmin() {
    const userRepo = this.dataSource.getRepository(User);
    const personRepo = this.dataSource.getRepository(Person);
    const roleRepo = this.dataSource.getRepository(Role);
    const userRoleRepo = this.dataSource.getRepository(UserRole);

    const adminUsername = 'admin';
    const adminPassword = 'admin123admin';

    let user = await userRepo.findOne({
      where: { username: adminUsername },
      relations: { person: true },
    });

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    if (user) {
      user.passwordHash = passwordHash;
      user.active = true;
      await userRepo.save(user);
    } else {
      let person = await personRepo.findOne({ where: { dni: '0000000000' } });
      if (!person) {
        person = personRepo.create({
          firstName: 'Admin',
          lastName: 'Sistema',
          middleName: '',
          dni: '0000000000',
          email: 'admin@sistema.com',
          phone: '0000000000',
          nationality: 'ecuatoriana',
          address: 'Sistema',
        });
        person = await personRepo.save(person);
      }

      user = userRepo.create({
        idPerson: person.id,
        username: adminUsername,
        passwordHash,
      });
      user = await userRepo.save(user);
    }

    const roles = await roleRepo.find();
    for (const role of roles) {
      const exists = await userRoleRepo.findOne({
        where: { idUser: user.idPerson, idRole: role.id },
      });
      if (!exists) {
        const ur = userRoleRepo.create({
          idUser: user.idPerson,
          idRole: role.id,
        });
        await userRoleRepo.save(ur);
      }
    }

    this.logger.log(`Admin listo: ${adminUsername} / ${adminPassword} (todos los roles)`);
  }
}
