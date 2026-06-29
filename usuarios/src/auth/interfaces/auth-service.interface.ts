export interface IAuthService {
  login(username: string, password: string): Promise<{ access_token: string }>;
}
