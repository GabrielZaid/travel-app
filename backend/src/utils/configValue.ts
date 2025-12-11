import { ConfigService } from '@nestjs/config';

/**
 * Safely read a configuration value from Nest's ConfigService.
 * Throws a descriptive Error when the value is missing/empty.
 */
export function getConfigValue<T, K extends keyof T>(
  configService: ConfigService<T>,
  key: K,
  errorPrefix?: string,
): T[K] {
  const value = configService.get<T[K]>(key as unknown as any);
  if (value === undefined || value === null || value === '') {
    const message = errorPrefix
      ? `${errorPrefix}: ${String(key)}`
      : `Missing config value: ${String(key)}`;
    throw new Error(message);
  }
  return value;
}
