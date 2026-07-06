import { RegisterDto } from '../dto/register.dto';

export interface IAuthService {
  login(
    username: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }>;
  register(
    dto: RegisterDto,
  ): Promise<{ access_token: string; refresh_token: string }>;
  refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string }>;
}
