import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { TrazabilidadModule } from './trazabilidad/trazabilidad.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db_postgres',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'admin',
      password: process.env.DB_PASSWORD || 'espe123',
      database: process.env.DB_DATABASE || 'reservas_db',
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNCHRONIZE === 'true' || true,
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    AsignacionesModule,
    TrazabilidadModule,
  ],
})
export class AppModule {}
