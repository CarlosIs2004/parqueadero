import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditService } from './audit.service';
import * as amqp from 'amqplib';
import { plainToClass } from 'class-transformer';
import { CreateAuditEventDto } from './dto/create-audit-event.dto';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class AuditConsumer implements OnModuleInit {
  private readonly logger = new Logger(AuditConsumer.name);
  private connection: any;
  private channel: any;

  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  async onModuleInit() {
    await this.connectAndConsume();
  }

  private async connectAndConsume() {
    const host = this.configService.get('RABBITMQ_HOST');
    const port = this.configService.get('RABBITMQ_PORT');
    const user = this.configService.get('RABBITMQ_USER');
    const pass = this.configService.get('RABBITMQ_PASSWORD');
    const url = `amqp://${user}:${pass}@${host}:${port}`;

    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      this.logger.log(`Connected to RabbitMQ at ${url}`);
      await this.consume();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Failed to connect to RabbitMQ: ${errorMessage}`);
      setTimeout(() => this.connectAndConsume(), 5000);
    }
  }

  private async consume() {
    const queue = this.configService.get('RABBITMQ_QUEUE');
    const exchange = this.configService.get('RABBITMQ_EXCHANGE');
    const routingKey = this.configService.get('RABBITMQ_ROUTING_KEY');

    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, exchange, routingKey);

    this.channel.consume(
      queue,
      async (msg) => {
        if (msg) {
          const content = msg.content.toString();
          this.logger.debug(`Mensaje recibido: ${content}`);
          try {
            const raw = JSON.parse(content);
            const dto = plainToClass(CreateAuditEventDto, raw);
            const errors = await validate(dto);

            if (Array.isArray(errors) && errors.length > 0) {
              const errorMessages = errors.map((e: ValidationError) =>
                Object.values(e.constraints || {}).join(', '),
              );
              this.logger.warn(`DTO inválido: ${errorMessages.join('; ')}`);
              this.channel.nack(msg, false, false);
              return;
            }

            await this.auditService.create(dto);
            this.logger.debug('Evento de auditoría guardado exitosamente');
            this.channel.ack(msg);
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : 'Error desconocido';
            this.logger.error(`Error procesando mensaje: ${errorMessage}`);
            this.channel.nack(msg, false, false);
          }
        }
      },
      { noAck: false },
    );
  }
}