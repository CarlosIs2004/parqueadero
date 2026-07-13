import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { Vehiculo } from './entities/vehiculo.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FactoryVehiculos } from './factory/factory.vehiculo';
import { AuditEvent, EventPublisher } from './event-publisher.service';

@Injectable()
export class VehiculosService {

  constructor(
    @InjectRepository(Vehiculo)
    private repositoryVehiculos:Repository<Vehiculo>,
    private eventPublisher: EventPublisher
  ){}
  async create(createVehiculoDto: CreateVehiculoDto, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<Vehiculo> {
    const existe = await this.repositoryVehiculos.findOne({
      where:{
        placa:createVehiculoDto.datos.placa
      }
    });
    if(existe){
      throw new ConflictException("Ya existe un vehículo con esa placa")
    }
    const vehiculo = FactoryVehiculos.crear(createVehiculoDto);

    const saved = await this.repositoryVehiculos.save(vehiculo);
    
    await this.emitEvent('CREATE', saved, ip, mac, { tipo: createVehiculoDto.tipo }, usuario, rol);
    return saved;
    
  }

  async findAll(tipo?: string): Promise<Vehiculo[]> {
    const where: any = {};
    if (tipo) {
      const tipoMap: Record<string, string> = {
        auto: 'Auto',
        moto: 'Motocicleta',
        camioneta: 'Camioneta',
      };
      where.tipo = tipoMap[tipo.toLowerCase()];
    }
    return this.repositoryVehiculos.find({ where });
  }

  async findOne(id: string):Promise<Vehiculo> {
    const existe = await this.repositoryVehiculos.findOne({
      where:{
        id:id,
      }
    });
    if(!existe)throw new NotFoundException('Vehículo no encontrado')
    return existe;
  }

  async update(id: string, updateVehiculoDto: UpdateVehiculoDto, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);

    if (updateVehiculoDto.placa && updateVehiculoDto.placa !== vehiculo.placa) {
      const existe = await this.repositoryVehiculos.findOne({
        where: { placa: updateVehiculoDto.placa }
      });
      if (existe) {
        throw new ConflictException(`El vehículo con placa ${updateVehiculoDto.placa} ya existe.`);
      }
    }
    Object.assign(vehiculo, updateVehiculoDto);

    const updated = await this.repositoryVehiculos.save(vehiculo);
    await this.emitEvent('UPDATE', updated, ip, mac, undefined, usuario, rol);
    return updated;
  }

  async remove(id: string, ip?: string, mac?: string, usuario?: string, rol?: string): Promise<void> {
    const vehiculo = await this.findOne(id);
    await this.repositoryVehiculos.remove(vehiculo);
    await this.emitEvent('DELETE', vehiculo, ip, mac, undefined, usuario, rol);
  }

  // Método auxiliar para publicar eventos
  private async emitEvent(
    accion: string,
    vehiculo: Vehiculo,
    ip?: string,
    mac?: string,
    datosExtra?: any,
    usuario?: string,
    rol?: string,
  ) {
    const event: AuditEvent = {
      servicio: 'ms-vehiculos',
      accion,
      entidad: 'VEHICULO',
      datos: { ...vehiculo, ...datosExtra },
      usuario,
      rol,
      ip,
      mac,
    };
    await this.eventPublisher.publish(event);
  }
}
