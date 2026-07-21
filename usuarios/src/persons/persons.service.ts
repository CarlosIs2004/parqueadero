import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Person } from './entities/person.entity';
import { UpdatePersonDto } from './dto/update-person.dto';
import { CreatePersonOnlyDto } from './dto/create-person-only.dto';
import type { IPersonsService } from './interfaces/persons-service.interface';
import type { IUsersService } from '../users/interfaces/users-service.interface';
import { EventPublisher } from '../common/event-publisher.service';

@Injectable()
export class PersonsService implements IPersonsService {
  constructor(
    @InjectRepository(Person)
    private personsRepository: Repository<Person>,
    @Inject('IUsersService')
    private usersService: IUsersService,
    private eventPublisher: EventPublisher,
  ) {}

  async findAll(): Promise<Person[]> {
    return this.personsRepository.find({ relations: { user: true } });
  }

  async findOne(id: string): Promise<Person> {
    const person = await this.personsRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    return person;
  }

  async createOnlyPerson(createPersonOnlyDto: CreatePersonOnlyDto, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<Person> {
    const existingPerson = await this.personsRepository.findOne({
      where: [{ dni: createPersonOnlyDto.dni }, { email: createPersonOnlyDto.email }],
    });

    if (existingPerson) {
      if (existingPerson.active) {
        throw new ConflictException(
          `A person with this DNI or email already exists (active)`,
        );
      }

      Object.assign(existingPerson, {
        ...createPersonOnlyDto,
        active: true,
      });
      const saved = await this.personsRepository.save(existingPerson);

      this.eventPublisher.publish({
        servicio: 'ms-usuarios',
        accion: 'CREATE',
        entidad: 'PERSONA',
        usuario,
        rol,
        datos: { dni: createPersonOnlyDto.dni, email: createPersonOnlyDto.email },
        ip,
        mac,
      });

      return this.findOne(saved.id);
    }

    const person = this.personsRepository.create({
      ...createPersonOnlyDto,
      active: createPersonOnlyDto.active ?? true,
    });
    const saved = await this.personsRepository.save(person);

    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'CREATE',
      entidad: 'PERSONA',
      usuario,
      rol,
      datos: { dni: createPersonOnlyDto.dni, email: createPersonOnlyDto.email },
      ip,
      mac,
    });

    return this.findOne(saved.id);
  }

  async update(id: string, updatePersonDto: UpdatePersonDto, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<Person> {
    const person = await this.findOne(id);

    if (updatePersonDto.username || updatePersonDto.password) {
      const userUpdate: Record<string, any> = {};
      if (updatePersonDto.username) {
        userUpdate.username = updatePersonDto.username;
      }
      if (updatePersonDto.password) {
        const salt = await bcrypt.genSalt();
        userUpdate.passwordHash = await bcrypt.hash(
          updatePersonDto.password,
          salt,
        );
      }
      await this.usersService.update(id, userUpdate);
    }

    const personFields: (keyof UpdatePersonDto)[] = [
      'firstName',
      'lastName',
      'middleName',
      'dni',
      'email',
      'phone',
      'nationality',
      'address',
      'active',
    ];
    const personUpdateData: Record<string, any> = {};
    for (const field of personFields) {
      if (updatePersonDto[field] !== undefined) {
        personUpdateData[field] = updatePersonDto[field];
      }
    }
    if (updatePersonDto.email) {
      const existingPersonByEmail = await this.personsRepository.findOne({
        where: { email: updatePersonDto.email },
      });
      if (existingPersonByEmail && existingPersonByEmail.id !== id) {
        throw new NotFoundException(`Email ya existente en otra persona`);
      }
    }
    if (updatePersonDto.dni) {
      const existingPersonByDni = await this.personsRepository.findOne({
        where: { dni: updatePersonDto.dni },
      });
      if (existingPersonByDni && existingPersonByDni.id !== id) {
        throw new NotFoundException(`DNI ya existente en otra persona`);
      }
    }

    if (Object.keys(personUpdateData).length > 0) {
      Object.assign(person, personUpdateData);
      await this.personsRepository.save(person);
    }

    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'UPDATE',
      entidad: 'PERSONA',
      usuario,
      rol,
      datos: { id, ...personUpdateData },
      ip,
      mac,
    });

    return this.findOne(id);
  }

  async softDelete(id: string, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<void> {
    const person = await this.findOne(id);
    person.active = false;
    await this.personsRepository.save(person);
    await this.usersService.softDelete(id);
    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'DELETE',
      entidad: 'PERSONA',
      usuario,
      rol,
      datos: { id },
      ip,
      mac,
    });
  }

  async hardDelete(id: string, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<void> {
    const person = await this.personsRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!person) {
      throw new NotFoundException(`Person with id ${id} not found`);
    }
    await this.personsRepository.remove(person);
    this.eventPublisher.publish({
      servicio: 'ms-usuarios',
      accion: 'DELETE',
      entidad: 'PERSONA',
      usuario,
      rol,
      datos: { id },
      ip,
      mac,
    });
  }
}
