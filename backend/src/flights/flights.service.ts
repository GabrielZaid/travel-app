import { Injectable } from '@nestjs/common';

@Injectable()
export class FlightsService {
  getFlights(): string {
    return 'This action returns all flights';
  }
}
