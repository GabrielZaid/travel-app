import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmadeusService } from '../amadeus/amadeus.service';
import {
  AMADEUS_CONFIG_KEYS,
  AMADEUS_HTTP_HEADERS,
  AMADEUS_HTTP_HEADER_VALUES,
} from '../constants/amadeus';
import { ERROR_MESSAGES } from '../constants/errors/common';
import { getConfigValue } from '../utils/configValue';
import { extractPayload, extractProviderError } from '../utils/amadeusResponse';
import { parseFlights } from '../utils/parsers/flights';
import { parseInspirationFlights } from '../utils/parsers/inspiration';
import { parseCheapestDates } from '../utils/parsers/cheapestDates';
import { parseAvailabilityFlights } from '../utils/parsers/availability';
import { sortAvailabilityResults } from '../utils/availability-sort';
import { resolvePagination, slicePage } from '../utils/pagination';
import { SearchFlightDto } from './dto/search-flight.dto';
import { SearchFlightInspirationDto } from './dto/search-flight-inspiration.dto';
import { CheapestDateDto } from './dto/cheapest-date.dto';
import { SearchAvailabilityDto } from './dto/search-availability.dto';
import type { AmadeusConfig } from 'src/types/amadeus';
import type {
  Flight,
  FlightInspiration,
  FlightCheapestDate,
  FlightAvailability,
} from '../types/flights';

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);

  constructor(
    private readonly configService: ConfigService<AmadeusConfig>,
    private readonly amadeusService: AmadeusService,
  ) {}

  async searchFlights(searchDto: SearchFlightDto): Promise<{
    data: Flight[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const params: Record<string, string> = {
      originLocationCode: searchDto.origin,
      destinationLocationCode: searchDto.destination,
      ...(searchDto.date ? { departureDate: searchDto.date } : {}),
      adults: '1',
      nonStop: 'true',
    };

    const endpoint = getConfigValue(
      this.configService,
      AMADEUS_CONFIG_KEYS.ENDPOINT_FLIGHT_OFFERS,
    );

    try {
      const response = await this.amadeusService.get<unknown>(endpoint, params);
      const payload = extractPayload(response);
      const allFlights = parseFlights(payload);

      const page =
        typeof searchDto.page === 'number' && searchDto.page >= 1
          ? searchDto.page
          : 1;
      const limit =
        typeof searchDto.limit === 'number' && searchDto.limit >= 1
          ? searchDto.limit
          : 5;
      const total = allFlights.length;
      const start = (page - 1) * limit;
      const data = allFlights.slice(start, start + limit);

      return { data, total, page, pageSize: limit };
    } catch (err: unknown) {
      const { status, data } = extractProviderError(err);

      this.logger.error(ERROR_MESSAGES.AMADEUS_API_FAILURE, {
        status,
        data,
        error: err,
      });

      const fallbackLimit =
        typeof searchDto.limit === 'number' && searchDto.limit >= 1
          ? searchDto.limit
          : 5;

      if (this.shouldReturnEmpty(status)) {
        return { data: [], total: 0, page: 1, pageSize: fallbackLimit } as {
          data: Flight[];
          total: number;
          page: number;
          pageSize: number;
        };
      }

      throw new HttpException(
        ERROR_MESSAGES.PROVIDER_CONNECTION_FAILURE,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async searchFlightsInspiration(
    searchDto: SearchFlightInspirationDto,
  ): Promise<FlightInspiration[]> {
    const params: Record<string, string> = {
      origin: searchDto.origin,
    };

    if (searchDto.destination) {
      params.destination = searchDto.destination;
    }

    if (
      typeof searchDto.maxPrice === 'number' &&
      Number.isFinite(searchDto.maxPrice)
    ) {
      params.maxPrice = searchDto.maxPrice.toString();
    }

    const endpoint = getConfigValue(
      this.configService,
      AMADEUS_CONFIG_KEYS.ENDPOINT_FLIGHT_DESTINATIONS,
    );

    try {
      const response = await this.amadeusService.get<unknown>(endpoint, params);
      const payload = extractPayload(response);

      const flights: FlightInspiration[] = parseInspirationFlights(payload, {
        destination: searchDto.destination,
      });

      return flights;
    } catch (err: unknown) {
      const { status, data } = extractProviderError(err);

      this.logger.error(ERROR_MESSAGES.AMADEUS_INSPIRATION_FAILURE, {
        status,
        data,
        error: err,
      });

      if (this.shouldReturnEmpty(status)) {
        this.logger.warn(ERROR_MESSAGES.AMADEUS_INSPIRATION_EMPTY_RESULT);
        return [] as FlightInspiration[];
      }

      throw new HttpException(
        ERROR_MESSAGES.PROVIDER_CONNECTION_FAILURE,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async findCheapestDates(
    searchDto: CheapestDateDto,
  ): Promise<FlightCheapestDate[]> {
    const params: Record<string, string> = {
      origin: searchDto.origin,
      destination: searchDto.destination,
      viewBy: 'DATE',
    };

    if (typeof searchDto.nonStop === 'string') {
      params.nonStop = searchDto.nonStop;
    }

    if (typeof searchDto.oneWay === 'string') {
      params.oneWay = searchDto.oneWay;
    }

    const endpoint = getConfigValue(
      this.configService,
      AMADEUS_CONFIG_KEYS.ENDPOINT_FLIGHT_DATES,
    );

    try {
      const response = await this.amadeusService.get<unknown>(endpoint, params);
      const payload = extractPayload(response);

      const flights: FlightCheapestDate[] = parseCheapestDates(payload);

      return flights;
    } catch (err: unknown) {
      const { status, data } = extractProviderError(err);

      this.logger.error(ERROR_MESSAGES.AMADEUS_CHEAPEST_DATES_FAILURE, {
        status,
        data,
        error: err,
      });

      if (this.shouldReturnEmpty(status)) {
        this.logger.warn(ERROR_MESSAGES.AMADEUS_CHEAPEST_DATES_EMPTY_RESULT);
        return [] as FlightCheapestDate[];
      }

      throw new HttpException(
        ERROR_MESSAGES.PROVIDER_CONNECTION_FAILURE,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async searchAvailability(searchDto: SearchAvailabilityDto): Promise<{
    data: FlightAvailability[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { page, limit } = resolvePagination({
      page: searchDto.page,
      limit: searchDto.limit,
    });

    const referenceDateTime = `${searchDto.date}T${searchDto.time}`;
    const body = {
      originDestinations: [
        {
          id: '1',
          originLocationCode: searchDto.origin,
          destinationLocationCode: searchDto.destination,
          departureDateTime: {
            date: searchDto.date,
            time: searchDto.time,
          },
        },
      ],
      travelers: [{ id: '1', travelerType: 'ADULT' }],
      sources: ['GDS'],
    } as const;

    const endpoint = getConfigValue(
      this.configService,
      AMADEUS_CONFIG_KEYS.ENDPOINT_FLIGHT_AVAILABILITY,
    );

    try {
      const response = await this.amadeusService.post<unknown>(endpoint, body, {
        headers: {
          [AMADEUS_HTTP_HEADERS.CONTENT_TYPE]:
            AMADEUS_HTTP_HEADER_VALUES.AMADEUS_JSON as string,
          [AMADEUS_HTTP_HEADERS.METHOD_OVERRIDE]: 'GET',
        },
      });
      const payload = extractPayload(response);
      const flights = parseAvailabilityFlights(payload);
      const sortedFlights = sortAvailabilityResults(
        flights,
        searchDto.sortBy,
        referenceDateTime,
      );
      const total = sortedFlights.length;
      const data = slicePage(sortedFlights, page, limit);

      return {
        data,
        total,
        page,
        pageSize: limit,
      };
    } catch (err: unknown) {
      const { status, data } = extractProviderError(err);

      this.logger.error(ERROR_MESSAGES.AMADEUS_AVAILABILITY_FAILURE, {
        status,
        data,
        error: err,
      });

      if (this.shouldReturnEmpty(status)) {
        this.logger.warn(ERROR_MESSAGES.AMADEUS_AVAILABILITY_EMPTY_RESULT);
        return {
          data: [],
          total: 0,
          page: 1,
          pageSize: limit,
        } as {
          data: FlightAvailability[];
          total: number;
          page: number;
          pageSize: number;
        };
      }

      throw new HttpException(
        ERROR_MESSAGES.PROVIDER_CONNECTION_FAILURE,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private shouldReturnEmpty(status?: number): boolean {
    return status === 400 || status === 404 || status === 500;
  }
}
