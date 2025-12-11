import { ConfigService } from '@nestjs/config';
export declare function getConfigValue<T, K extends keyof T>(configService: ConfigService<T>, key: K, errorPrefix?: string): T[K];
