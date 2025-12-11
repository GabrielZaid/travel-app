"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FlightsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amadeus_service_1 = require("../amadeus/amadeus.service");
const amadeus_1 = require("../constants/amadeus");
const common_2 = require("../constants/errors/common");
const configValue_1 = require("../utils/configValue");
const amadeusResponse_1 = require("../utils/amadeusResponse");
const flights_1 = require("../utils/parsers/flights");
const inspiration_1 = require("../utils/parsers/inspiration");
const cheapestDates_1 = require("../utils/parsers/cheapestDates");
let FlightsService = FlightsService_1 = class FlightsService {
    configService;
    amadeusService;
    logger = new common_1.Logger(FlightsService_1.name);
    constructor(configService, amadeusService) {
        this.configService = configService;
        this.amadeusService = amadeusService;
    }
    async searchFlights(searchDto) {
        const params = {
            originLocationCode: searchDto.origin,
            destinationLocationCode: searchDto.destination,
            ...(searchDto.date ? { departureDate: searchDto.date } : {}),
            adults: '1',
            nonStop: 'true',
        };
        const endpoint = (0, configValue_1.getConfigValue)(this.configService, amadeus_1.AMADEUS_CONFIG_KEYS.ENDPOINT_FLIGHT_OFFERS);
        try {
            const response = await this.amadeusService.get(endpoint, params);
            const payload = (0, amadeusResponse_1.extractPayload)(response);
            return (0, flights_1.parseFlights)(payload);
        }
        catch (err) {
            const { status, data } = (0, amadeusResponse_1.extractProviderError)(err);
            this.logger.error(common_2.ERROR_MESSAGES.AMADEUS_API_FAILURE, {
                status,
                data,
                error: err,
            });
            if (this.shouldReturnEmpty(status)) {
                return [];
            }
            throw new common_1.HttpException(common_2.ERROR_MESSAGES.PROVIDER_CONNECTION_FAILURE, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async searchFlightsInspiration(searchDto) {
        const params = {
            origin: searchDto.origin,
        };
        if (searchDto.destination) {
            params.destination = searchDto.destination;
        }
        if (typeof searchDto.maxPrice === 'number' &&
            Number.isFinite(searchDto.maxPrice)) {
            params.maxPrice = searchDto.maxPrice.toString();
        }
        const endpoint = (0, configValue_1.getConfigValue)(this.configService, amadeus_1.AMADEUS_CONFIG_KEYS.ENDPOINT_FLIGHT_DESTINATIONS);
        try {
            const response = await this.amadeusService.get(endpoint, params);
            const payload = (0, amadeusResponse_1.extractPayload)(response);
            const flights = (0, inspiration_1.parseInspirationFlights)(payload, {
                destination: searchDto.destination,
            });
            return flights;
        }
        catch (err) {
            const { status, data } = (0, amadeusResponse_1.extractProviderError)(err);
            this.logger.error(common_2.ERROR_MESSAGES.AMADEUS_INSPIRATION_FAILURE, {
                status,
                data,
                error: err,
            });
            if (this.shouldReturnEmpty(status)) {
                this.logger.warn(common_2.ERROR_MESSAGES.AMADEUS_INSPIRATION_EMPTY_RESULT);
                return [];
            }
            throw new common_1.HttpException(common_2.ERROR_MESSAGES.PROVIDER_CONNECTION_FAILURE, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async findCheapestDates(searchDto) {
        const params = {
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
        const endpoint = (0, configValue_1.getConfigValue)(this.configService, amadeus_1.AMADEUS_CONFIG_KEYS.ENDPOINT_FLIGHT_DATES);
        try {
            const response = await this.amadeusService.get(endpoint, params);
            const payload = (0, amadeusResponse_1.extractPayload)(response);
            const flights = (0, cheapestDates_1.parseCheapestDates)(payload);
            return flights;
        }
        catch (err) {
            const { status, data } = (0, amadeusResponse_1.extractProviderError)(err);
            this.logger.error(common_2.ERROR_MESSAGES.AMADEUS_CHEAPEST_DATES_FAILURE, {
                status,
                data,
                error: err,
            });
            if (this.shouldReturnEmpty(status)) {
                this.logger.warn(common_2.ERROR_MESSAGES.AMADEUS_CHEAPEST_DATES_EMPTY_RESULT);
                return [];
            }
            throw new common_1.HttpException(common_2.ERROR_MESSAGES.PROVIDER_CONNECTION_FAILURE, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    shouldReturnEmpty(status) {
        return status === 400 || status === 404 || status === 500;
    }
};
exports.FlightsService = FlightsService;
exports.FlightsService = FlightsService = FlightsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        amadeus_service_1.AmadeusService])
], FlightsService);
//# sourceMappingURL=flights.service.js.map