import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchFlightInspirationDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  origin: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;
}
