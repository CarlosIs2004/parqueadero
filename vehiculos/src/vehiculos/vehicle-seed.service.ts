import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Auto } from './entities/auto.entity';
import { Motocicleta, TipoMoto } from './entities/motocicleta.entity';
import { Camioneta } from './entities/camioneta.entity';
import { Clasificacion } from './entities/vehiculo.entity';

@Injectable()
export class VehicleSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(VehicleSeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    try {
      await this.seedVehicles();
    } catch (error) {
      this.logger.error('Error en seed de vehículos:', error);
    }
  }

  private async seedVehicles() {
    const autoRepo = this.dataSource.getRepository(Auto);
    const motoRepo = this.dataSource.getRepository(Motocicleta);
    const camionetaRepo = this.dataSource.getRepository(Camioneta);

    const totalVehiculos =
      (await autoRepo.count()) +
      (await motoRepo.count()) +
      (await camionetaRepo.count());

    if (totalVehiculos > 0) {
      this.logger.log(`Ya existen ${totalVehiculos} vehículos, se omite el seed`);
      return;
    }

    // ── Autos ──
    const autos = autoRepo.create([
      {
        placa: 'PBC-1234',
        marca: 'Toyota',
        modelo: 'Corolla',
        color: 'Rojo',
        anio: 2024,
        clasificacion: Clasificacion.GASOLINA,
        numeroPuertas: 4,
        capacidadMaletero: 470,
      },
      {
        placa: 'GHI-5678',
        marca: 'Chevrolet',
        modelo: 'Aveo',
        color: 'Azul',
        anio: 2022,
        clasificacion: Clasificacion.GASOLINA,
        numeroPuertas: 4,
        capacidadMaletero: 350,
      },
      {
        placa: 'TES-001',
        marca: 'Tesla',
        modelo: 'Model 3',
        color: 'Blanco',
        anio: 2024,
        clasificacion: Clasificacion.ELECTRICO,
        numeroPuertas: 4,
        capacidadMaletero: 425,
      },
    ]);
    await autoRepo.save(autos);
    this.logger.log(`${autos.length} autos de ejemplo creados`);

    // ── Motos ──
    const motos = motoRepo.create([
      {
        placa: 'MTO-001',
        marca: 'Yamaha',
        modelo: 'MT-07',
        color: 'Negro',
        anio: 2023,
        clasificacion: Clasificacion.GASOLINA,
        tipoMoto: TipoMoto.DEPORTIVO,
      },
      {
        placa: 'MTO-002',
        marca: 'Honda',
        modelo: 'Navic',
        color: 'Rojo',
        anio: 2024,
        clasificacion: Clasificacion.GASOLINA,
        tipoMoto: TipoMoto.SCOOTER,
      },
    ]);
    await motoRepo.save(motos);
    this.logger.log(`${motos.length} motos de ejemplo creadas`);

    // ── Camionetas ──
    const camionetas = camionetaRepo.create([
      {
        placa: 'CAM-001',
        marca: 'Ford',
        modelo: 'Ranger',
        color: 'Blanca',
        anio: 2023,
        clasificacion: Clasificacion.DIESEL,
        cabina: 'Doble',
        capacidadCarga: 1500,
      },
    ]);
    await camionetaRepo.save(camionetas);
    this.logger.log(`${camionetas.length} camioneta de ejemplo creada`);

    this.logger.log('=== Seed de vehículos completado ===');
  }
}
