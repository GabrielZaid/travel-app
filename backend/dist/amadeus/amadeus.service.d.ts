import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AmadeusConfig } from '../types/amadeus';
export declare class AmadeusService {
    private readonly configService;
    private readonly httpService;
    private accessToken;
    private tokenExpiry;
    private readonly logger;
    constructor(configService: ConfigService<AmadeusConfig>, httpService: HttpService);
    get<T = unknown>(endpoint: string, params?: Record<string, string>): Promise<T>;
    private getAccessToken;
    private refreshAccessToken;
    private getConfigValue;
}
