import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrazabilidadController } from './trazabilidad.controller';
import { TrazabilidadService } from './trazabilidad.service';
import { Trazabilidad } from './entities/trazabilidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trazabilidad])],
  controllers: [TrazabilidadController],
  providers: [TrazabilidadService],
  exports: [TrazabilidadService],
})
export class TrazabilidadModule {}
