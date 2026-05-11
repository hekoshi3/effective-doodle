import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MediaService {
  private readonly backendUrl: string;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('BACKEND_URL', '127.0.0.1');
    // Use BACKEND_PORT if Frontend is not configured for pattern BFF
    const port = this.configService.get<string>('FRONTEND_PORT', '5001');

    this.backendUrl = url ? `${url}:${port}` : 'http://127.0.0.1:5001';
  }

  getAbsoluteUrl(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    const cleanPath = path.replace(/\\/g, '/');
    const normalizedPath = cleanPath.startsWith('/')
      ? cleanPath
      : `/${cleanPath}`;

    return `${normalizedPath}`;
  }
}
