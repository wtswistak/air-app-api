import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  private getString(key: string): string {
    const env = this.configService.get<string>(key);
    if (!env) {
      throw new Error(`Environment variable ${key} not found`);
    }
    return env;
  }

  private getNumber(key: string): number {
    const env = this.configService.get<number>(key);
    if (!env) {
      throw new Error(`Environment variable ${key} not found`);
    }
    return env;
  }

  get GIOSApiUrl(): string {
    return this.getString('GIOS_API_URL');
  }

  get appConfig() {
    return {
      port: this.getNumber('PORT'),
      url: this.getString('URL'),
    };
  }

  get redisURL(): string {
    return this.getString('REDIS_URL');
  }

  get apiKey(): string {
    return this.getString('API_KEY');
  }
}
