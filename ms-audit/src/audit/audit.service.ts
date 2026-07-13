import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAuditEventDto } from './dto/create-audit-event.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';
import { Repository } from 'typeorm';
import { EventoAuditoria } from './entities/evento-auditoria.entity';

@Injectable()
export class AuditService {
  remove(arg0: number) {
    throw new Error('Method not implemented.');
  }
  update(arg0: number, updateAuditDto: UpdateAuditDto) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(EventoAuditoria)
    private auditRepo: Repository<EventoAuditoria>,
  ) {}

  async create(dto: CreateAuditEventDto): Promise<EventoAuditoria> {
    const mewEvent = this.auditRepo.create({
      ...dto,
      username: dto.usuario,
      timestamp: new Date(),
    });

    return this.auditRepo.save(mewEvent);
  }

  async findAll(): Promise<EventoAuditoria[]> {
    return this.auditRepo.find({ order: { timestamp: 'DESC' } });
  }

  async findOne(id: string): Promise<EventoAuditoria | null> {
    return this.auditRepo.findOne({ where: { id } });
  }
}