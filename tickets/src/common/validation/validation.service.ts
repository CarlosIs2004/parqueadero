import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface VehiculoData {
  tipo: string;
  placa: string;
}

export type EstadoEspacio = 'DISPONIBLE' | 'OCUPADO' | 'INACTIVO';

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
      throw new BadRequestException(
        `El vehículo con ID "${id}" no existe (status: ${status})`,
      );
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      if (error?.response?.status === 404) {
        throw new BadRequestException(
          `El vehículo con ID "${id}" no existe`,
        );
      }
      this.logger.error(
        `Error validando vehículo ${id}: ${error?.message}`,
      );
      throw new BadRequestException(
        `No se pudo validar el vehículo "${id}": ${error?.message || 'error de conexión'}`,
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
      throw new BadRequestException(
        `El usuario con ID "${id}" no existe (status: ${status})`,
      );
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      if (error?.response?.status === 404) {
        throw new BadRequestException(
          `El usuario con ID "${id}" no existe`,
        );
      }
      this.logger.error(
        `Error validando usuario ${id}: ${error?.message}`,
      );
      throw new BadRequestException(
        `No se pudo validar el usuario "${id}": ${error?.message || 'error de conexión'}`,
      );
    }
  }

  async validateEspacio(id: string): Promise<string> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<{ estado: string; tipo: string }>(`${this.espaciosUrl}/${id}`, {
          headers: this.headers,
        }),
      );
      if (data.estado !== 'DISPONIBLE') {
        throw new BadRequestException(
          `El espacio con ID "${id}" no está disponible. Estado actual: "${data.estado}"`,
        );
      }
      return data.tipo;
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      if (error?.response?.status === 404) {
        throw new BadRequestException(
          `El espacio con ID "${id}" no existe`,
        );
      }
      this.logger.error(
        `Error validando espacio ${id}: ${error?.message}`,
      );
      throw new BadRequestException(
        `No se pudo validar el espacio "${id}": ${error?.message || 'error de conexión'}`,
      );
    }
  }

  async fetchVehiculoData(id: string): Promise<VehiculoData> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.vehiculosUrl}/${id}`, {
          headers: this.headers,
        }),
      );
      return { tipo: data.tipo, placa: data.placa };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new BadRequestException(
          `El vehículo con ID "${id}" no existe`,
        );
      }
      this.logger.error(
        `Error obteniendo datos del vehículo ${id}: ${error?.message}`,
      );
      throw new BadRequestException(
        `No se pudieron obtener los datos del vehículo "${id}": ${error?.message || 'error de conexión'}`,
      );
    }
  }

  /**
   * Mapea el tipo de vehículo del servicio vehiculos al tipo de espacio del servicio zonas.
   */
  private mapVehiculoTipoToEspacioTipo(vehiculoTipo: string): string | null {
    const mapping: Record<string, string> = {
      Auto: 'AUTO',
      Motocicleta: 'MOTO',
      Camioneta: 'BUSETA',
    };
    return mapping[vehiculoTipo] ?? null;
  }

  /**
   * Valida que el tipo de vehículo sea compatible con el tipo de espacio.
   */
  validateCompatibilidad(vehiculoTipo: string, espaciotipo: string): void {
    const espaciTipoEsperado = this.mapVehiculoTipoToEspacioTipo(vehiculoTipo);
    if (espaciTipoEsperado && espaciTipoEsperado !== espaciotipo) {
      throw new BadRequestException(
        `El vehículo tipo "${vehiculoTipo}" no es compatible con el espacio tipo "${espaciotipo}". ` +
        `Espacios esperados para este vehículo: "${espaciTipoEsperado}"`,
      );
    }
  }

  async updateEspacioEstado(id: string, estado: EstadoEspacio): Promise<void> {
    try {
      const url = `${this.espaciosUrl}/${id}/estado?estado=${estado}`;
      this.logger.log(`Actualizando estado del espacio ${id} a ${estado} — PATCH ${url}`);
      await firstValueFrom(
        this.httpService.patch(url, null, { headers: this.headers }),
      );
    } catch (error: any) {
      this.logger.error(
        `Error actualizando estado del espacio ${id} a ${estado}: ${error?.message}`,
      );
      // No lanzamos excepción acá para que no rompa el flujo del ticket
      // si el estado del espacio falla. Se loguea nomás.
    }
  }
}
