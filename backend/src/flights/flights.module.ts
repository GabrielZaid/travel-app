import { Module } from '@nestjs/common';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { AmadeusModule } from '../amadeus/amadeus.module';

@Module({
  imports: [AmadeusModule],
  controllers: [FlightsController],
  providers: [FlightsService],
})
export class FlightsModule {}
