import { FlightsService } from './flights.service';
export declare class FlightsController {
    private readonly flightsService;
    constructor(flightsService: FlightsService);
    getFlights(): string;
}
