import { IsNotEmpty, IsString, Length, IsDateString } from 'class-validator';

export class SearchFlightDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  origin: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  destination: string;

  @IsDateString()
  date?: string;
}
