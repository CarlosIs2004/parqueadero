import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VehiculosClientService {
  private readonly logger = new Logger(VehiculosClientService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.baseUrl = configService.get<string>('VEHICULOS_API_URL', 'http://kong:8000/api/vehiculos');
  }

  async getVehiculo(id: string): Promise<Record<string, unknown> | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/${id}`),
      );
      return data as Record<string, unknown>;
    } catch (error) {
      this.logger.error(`Error fetching vehicle ${id}: ${error.message}`);
      return null;
    }
  }
}
