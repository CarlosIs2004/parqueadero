import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Client } from 'pg';
import { AppModule } from './app.module';

async function ensureDatabase() {
  const dbName = process.env.DB_DATABASE || 'reservas_db';
  const client = new Client({
    host: process.env.DB_HOST || 'db_postgres',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'espe123',
    database: 'vehiculos_db',
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully`);
    }
  } finally {
    await client.end();
  }
}

async function bootstrap() {
  await ensureDatabase();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Microservicio de Asignación y Trazabilidad')
    .setDescription('Gestión de asignación de vehículos a propietarios y auditoría')
    .setVersion('1.0')
    .addServer('http://localhost:8000')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs/reservas', app, document);

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
