import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import {
  AMADEUS_AUTH_FIELDS,
  AMADEUS_AUTH_VALUES,
  AMADEUS_CONFIG_KEYS,
  AMADEUS_HTTP_HEADER_VALUES,
  AMADEUS_HTTP_HEADERS,
  EXPIRED,
  BEARER,
} from '../constants/amadeus';
import {
  ERROR_EXPIRED_AMADEUS_TOKEN_STATE,
  ERROR_FETCHING_AMADEUS_TOKEN,
  ERROR_INVALID_AMADEUS_TOKEN_TYPE,
  ERROR_FETCHING_AMADEUS_DATA_FROM_ENDPOINT,
} from '../constants/errors/amadeus';
import { AmadeusConfig, AmadeusOAuthResponse } from '../types/amadeus';
import { getConfigValue } from '../utils/configValue';

@Injectable()
export class AmadeusService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private readonly logger = new Logger(AmadeusService.name);

  constructor(
    private readonly configService: ConfigService<AmadeusConfig>,
    private readonly httpService: HttpService,
  ) {}

  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, string>,
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${getConfigValue(this.configService, AMADEUS_CONFIG_KEYS.AMADEUS_API_URL)}/${endpoint}`;

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }),
      );
      return response.data as T;
    } catch (error) {
      this.logger.error(
        `${ERROR_FETCHING_AMADEUS_DATA_FROM_ENDPOINT}: ${endpoint}`,
        error as Error,
      );
      throw error;
    }
  }

  async post<T = unknown>(
    endpoint: string,
    body: unknown,
    options?: { headers?: Record<string, string> },
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${getConfigValue(this.configService, AMADEUS_CONFIG_KEYS.AMADEUS_API_URL)}/${endpoint}`;

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, body, {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(options?.headers ?? {}),
          },
        }),
      );
      return response.data as T;
    } catch (error) {
      this.logger.error(
        `${ERROR_FETCHING_AMADEUS_DATA_FROM_ENDPOINT}: ${endpoint}`,
        error as Error,
      );
      throw error;
    }
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && this.tokenExpiry && now < this.tokenExpiry) {
      return this.accessToken;
    }

    return this.refreshAccessToken();
  }

  private async refreshAccessToken(): Promise<string> {
    const params = new URLSearchParams();
    params.append(
      AMADEUS_AUTH_FIELDS.GRANT_TYPE,
      AMADEUS_AUTH_VALUES.CLIENT_CREDENTIALS,
    );
    params.append(
      AMADEUS_AUTH_FIELDS.CLIENT_ID,
      getConfigValue(this.configService, AMADEUS_CONFIG_KEYS.CLIENT_ID),
    );
    params.append(
      AMADEUS_AUTH_FIELDS.CLIENT_SECRET,
      getConfigValue(this.configService, AMADEUS_CONFIG_KEYS.CLIENT_SECRET),
    );
    try {
      const { data } = await lastValueFrom(
        this.httpService.post<AmadeusOAuthResponse>(
          getConfigValue(
            this.configService,
            AMADEUS_CONFIG_KEYS.AUTH_URL_AMADEUS,
          ),
          params,
          {
            headers: {
              [AMADEUS_HTTP_HEADERS.CONTENT_TYPE]:
                AMADEUS_HTTP_HEADER_VALUES.FORM_URL_ENCODED,
            },
          },
        ),
      );

      if (data.token_type !== BEARER) {
        this.logger.error(
          `${ERROR_INVALID_AMADEUS_TOKEN_TYPE}: ${data.token_type as string}`,
        );
        throw new Error(ERROR_INVALID_AMADEUS_TOKEN_TYPE);
      }

      if (data.state === EXPIRED) {
        this.logger.error(ERROR_EXPIRED_AMADEUS_TOKEN_STATE);
        throw new Error(ERROR_EXPIRED_AMADEUS_TOKEN_STATE);
      }

      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000;

      return this.accessToken;
    } catch (error) {
      this.accessToken = null;
      this.tokenExpiry = null;
      this.logger.error(ERROR_FETCHING_AMADEUS_TOKEN, error as Error);
      throw new Error(ERROR_FETCHING_AMADEUS_TOKEN);
    }
  }
}
