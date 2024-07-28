import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction } from 'express';
import { AppConfigService } from 'src/common/config/app-config.service';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(private readonly configService: AppConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== this.configService.apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }
    next();
  }
}
