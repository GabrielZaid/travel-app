import { ConfigService } from '@nestjs/config';
import { AmadeusService } from '../amadeus/amadeus.service';
import { SearchFlightDto } from './dto/search-flight.dto';
import { SearchFlightInspirationDto } from './dto/search-flight-inspiration.dto';
import { CheapestDateDto } from './dto/cheapest-date.dto';
import type { AmadeusConfig } from 'src/types/amadeus';
import type { Flight, FlightInspiration, FlightCheapestDate } from '../types/flights';
export declare class FlightsService {
    private readonly configService;
    private readonly amadeusService;
    private readonly logger;
    constructor(configService: ConfigService<AmadeusConfig>, amadeusService: AmadeusService);
    searchFlights(searchDto: SearchFlightDto): Promise<Flight[]>;
    searchFlightsInspiration(searchDto: SearchFlightInspirationDto): Promise<FlightInspiration[]>;
    findCheapestDates(searchDto: CheapestDateDto): Promise<FlightCheapestDate[]>;
    private shouldReturnEmpty;
}
