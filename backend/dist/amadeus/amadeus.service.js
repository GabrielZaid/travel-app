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
var AmadeusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmadeusService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const amadeus_1 = require("../constants/amadeus");
const amadeus_2 = require("../constants/errors/amadeus");
let AmadeusService = AmadeusService_1 = class AmadeusService {
    configService;
    httpService;
    accessToken = null;
    tokenExpiry = null;
    logger = new common_1.Logger(AmadeusService_1.name);
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
    }
    async get(endpoint, params) {
        const token = await this.getAccessToken();
        const url = `${this.getConfigValue(amadeus_1.AMADEUS_CONFIG_KEYS.AMADEUS_API_URL)}/${endpoint}`;
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`${amadeus_2.ERROR_FETCHING_AMADEUS_DATA_FROM_ENDPOINT}: ${endpoint}`, error);
            throw error;
        }
    }
    async getAccessToken() {
        const now = Date.now();
        if (this.accessToken && this.tokenExpiry && now < this.tokenExpiry) {
            return this.accessToken;
        }
        return this.refreshAccessToken();
    }
    async refreshAccessToken() {
        const params = new URLSearchParams();
        params.append(amadeus_1.AMADEUS_AUTH_FIELDS.GRANT_TYPE, amadeus_1.AMADEUS_AUTH_VALUES.CLIENT_CREDENTIALS);
        params.append(amadeus_1.AMADEUS_AUTH_FIELDS.CLIENT_ID, this.getConfigValue(amadeus_1.AMADEUS_CONFIG_KEYS.CLIENT_ID));
        params.append(amadeus_1.AMADEUS_AUTH_FIELDS.CLIENT_SECRET, this.getConfigValue(amadeus_1.AMADEUS_CONFIG_KEYS.CLIENT_SECRET));
        try {
            const { data } = await (0, rxjs_1.lastValueFrom)(this.httpService.post(this.getConfigValue(amadeus_1.AMADEUS_CONFIG_KEYS.AUTH_URL_AMADEUS), params, {
                headers: {
                    [amadeus_1.AMADEUS_HTTP_HEADERS.CONTENT_TYPE]: amadeus_1.AMADEUS_HTTP_HEADER_VALUES.FORM_URL_ENCODED,
                },
            }));
            if (data.token_type !== amadeus_1.BEARER) {
                this.logger.error(`${amadeus_2.ERROR_INVALID_AMADEUS_TOKEN_TYPE}: ${data.token_type}`);
                throw new Error(amadeus_2.ERROR_INVALID_AMADEUS_TOKEN_TYPE);
            }
            if (data.state === amadeus_1.EXPIRED) {
                this.logger.error(amadeus_2.ERROR_EXPIRED_AMADEUS_TOKEN_STATE);
                throw new Error(amadeus_2.ERROR_EXPIRED_AMADEUS_TOKEN_STATE);
            }
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + data.expires_in * 1000;
            return this.accessToken;
        }
        catch (error) {
            this.accessToken = null;
            this.tokenExpiry = null;
            this.logger.error(amadeus_2.ERROR_FETCHING_AMADEUS_TOKEN, error);
            throw new Error(amadeus_2.ERROR_FETCHING_AMADEUS_TOKEN);
        }
    }
    getConfigValue(key) {
        const value = this.configService.get(key);
        if (value === undefined || value === null || value === '') {
            throw new Error(`${amadeus_2.ERROR_MISSING_AMADEUS_CONFIG}: ${String(key)}`);
        }
        return value;
    }
};
exports.AmadeusService = AmadeusService;
exports.AmadeusService = AmadeusService = AmadeusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], AmadeusService);
//# sourceMappingURL=amadeus.service.js.map