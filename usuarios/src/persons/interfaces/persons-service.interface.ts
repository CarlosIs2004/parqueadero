import { Person } from '../entities/person.entity';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { CreatePersonOnlyDto } from '../dto/create-person-only.dto';

export interface IPersonsService {
  findAll(): Promise<Person[]>;
  findOne(id: string): Promise<Person>;
  createOnlyPerson(createPersonOnlyDto: CreatePersonOnlyDto, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<Person>;
  update(id: string, updatePersonDto: UpdatePersonDto, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<Person>;
  softDelete(id: string, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<void>;
  hardDelete(id: string, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<void>;
}
