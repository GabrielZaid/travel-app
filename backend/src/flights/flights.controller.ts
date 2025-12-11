import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FlightsService } from './flights.service';
import { SearchFlightDto } from './dto/search-flight.dto';
import { SearchFlightInspirationDto } from './dto/search-flight-inspiration.dto';
import { CheapestDateDto } from './dto/cheapest-date.dto';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getFlights(@Query() searchDto: SearchFlightDto) {
    return this.flightsService.searchFlights(searchDto);
  }

  @Get('inspiration')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getFlightsInspiration(@Query() searchDto: SearchFlightInspirationDto) {
    return this.flightsService.searchFlightsInspiration(searchDto);
  }

  @Get('cheapest-dates')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getCheapestDates(@Query() searchDto: CheapestDateDto) {
    return this.flightsService.findCheapestDates(searchDto);
  }
}
