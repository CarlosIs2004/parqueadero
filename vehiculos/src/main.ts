import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Vehículos API')
    .setDescription('API para la gestión de vehículos (Autos, Motocicletas, Camionetas)')
    .setVersion('1.0')
    .addServer('http://localhost:8000')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs/vehiculos', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
