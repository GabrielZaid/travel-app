import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AmadeusService } from './amadeus.service';

@Module({
  imports: [HttpModule],
  providers: [AmadeusService],
  exports: [AmadeusService],
})
export class AmadeusModule {}
