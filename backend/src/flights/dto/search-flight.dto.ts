import { IsNotEmpty, IsString, Length, IsDateString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
