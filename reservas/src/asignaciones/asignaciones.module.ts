import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AsignacionesController } from './asignaciones.controller';
import { AsignacionesService } from './asignaciones.service';
import { Asignacion } from './entities/asignacion.entity';
import { VehiculosClientService } from '../common/services/vehiculos-client.service';

@Module({
  imports: [TypeOrmModule.forFeature([Asignacion]), HttpModule],
  controllers: [AsignacionesController],
  providers: [AsignacionesService, VehiculosClientService],
  exports: [AsignacionesService],
})
export class AsignacionesModule {}
