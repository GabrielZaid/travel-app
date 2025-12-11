import { FlightsService } from './flights.service';
import { SearchFlightDto } from './dto/search-flight.dto';
import { SearchFlightInspirationDto } from './dto/search-flight-inspiration.dto';
import { CheapestDateDto } from './dto/cheapest-date.dto';
export declare class FlightsController {
    private readonly flightsService;
    constructor(flightsService: FlightsService);
    getFlights(searchDto: SearchFlightDto): Promise<import("../types/flights").Flight[]>;
    getFlightsInspiration(searchDto: SearchFlightInspirationDto): Promise<import("../types/flights").FlightInspiration[]>;
    getCheapestDates(searchDto: CheapestDateDto): Promise<import("../types/flights").FlightCheapestDate[]>;
}
