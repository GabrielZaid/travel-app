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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightsController = void 0;
const common_1 = require("@nestjs/common");
const flights_service_1 = require("./flights.service");
const search_flight_dto_1 = require("./dto/search-flight.dto");
const search_flight_inspiration_dto_1 = require("./dto/search-flight-inspiration.dto");
const cheapest_date_dto_1 = require("./dto/cheapest-date.dto");
let FlightsController = class FlightsController {
    flightsService;
    constructor(flightsService) {
        this.flightsService = flightsService;
    }
    async getFlights(searchDto) {
        return this.flightsService.searchFlights(searchDto);
    }
    async getFlightsInspiration(searchDto) {
        return this.flightsService.searchFlightsInspiration(searchDto);
    }
    async getCheapestDates(searchDto) {
        return this.flightsService.findCheapestDates(searchDto);
    }
};
exports.FlightsController = FlightsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_flight_dto_1.SearchFlightDto]),
    __metadata("design:returntype", Promise)
], FlightsController.prototype, "getFlights", null);
__decorate([
    (0, common_1.Get)('inspiration'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_flight_inspiration_dto_1.SearchFlightInspirationDto]),
    __metadata("design:returntype", Promise)
], FlightsController.prototype, "getFlightsInspiration", null);
__decorate([
    (0, common_1.Get)('cheapest-dates'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cheapest_date_dto_1.CheapestDateDto]),
    __metadata("design:returntype", Promise)
], FlightsController.prototype, "getCheapestDates", null);
exports.FlightsController = FlightsController = __decorate([
    (0, common_1.Controller)('flights'),
    __metadata("design:paramtypes", [flights_service_1.FlightsService])
], FlightsController);
//# sourceMappingURL=flights.controller.js.map