import { Controller, Get } from '@nestjs/common';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  getFlights(): string {
    try {
      this.flightsService.getFlights();
    } catch (error) {
      console.log(error);
    }
    return 'This action returns all flights';
  }
}
