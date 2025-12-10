import { Module } from '@nestjs/common';
import { AmadeusService } from './amadeus.service';

@Module({
  providers: [AmadeusService],
})
export class AmadeusModule {}
