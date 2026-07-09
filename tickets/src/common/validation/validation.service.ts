import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get jwtToken(): string | undefined {
    return this.configService.get<string>('SERVICE_JWT_TOKEN');
  }

  private get vehiculosUrl(): string {
    return this.configService.get<string>(
      'VEHICULOS_API_URL',
      'http://kong:8000/api/vehiculos',
    );
  }

  private get usuariosUrl(): string {
    return this.configService.get<string>(
      'USUARIOS_API_URL',
      'http://kong:8000/api/usuarios',
    );
  }

  private get espaciosUrl(): string {
    return this.configService.get<string>(
      'ESPACIOS_API_URL',
      'http://kong:8000/api/espacios',
    );
  }

  private get headers(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.jwtToken) {
      headers['Authorization'] = `Bearer ${this.jwtToken}`;
    }
    return headers;
  }

  async validateVehiculo(id: string): Promise<void> {
    try {
      const { status } = await firstValueFrom(
        this.httpService.get(`${this.vehiculosUrl}/${id}`, {
          headers: this.headers,
        }),
      );
      if (status === 200) return;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new BadRequestException(
          `El vehículo con ID "${id}" no existe`,
        );
      }
      this.logger.warn(
        `No se pudo validar vehículo ${id}: ${error?.message}. Continuando sin validación.`,
      );
    }
  }

  async validateUsuario(id: string): Promise<void> {
    try {
      const { status } = await firstValueFrom(
        this.httpService.get(`${this.usuariosUrl}/${id}`, {
          headers: this.headers,
        }),
      );
      if (status === 200) return;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new BadRequestException(
          `El usuario con ID "${id}" no existe`,
        );
      }
      this.logger.warn(
        `No se pudo validar usuario ${id}: ${error?.message}. Continuando sin validación.`,
      );
    }
  }

  async validateEspacio(id: string): Promise<void> {
    try {
      const { status } = await firstValueFrom(
        this.httpService.get(`${this.espaciosUrl}/${id}`, {
          headers: this.headers,
        }),
      );
      if (status === 200) return;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new BadRequestException(
          `El espacio con ID "${id}" no existe`,
        );
      }
      this.logger.warn(
        `No se pudo validar espacio ${id}: ${error?.message}. Continuando sin validación.`,
      );
    }
  }
}
