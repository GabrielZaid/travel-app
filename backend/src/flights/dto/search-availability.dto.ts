import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';
import {
  AVAILABILITY_SORT_VALUES,
  AvailabilitySort,
} from '../../types/flights';

export class SearchAvailabilityDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  origin!: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  destination!: string;

  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  time!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsIn(AVAILABILITY_SORT_VALUES as readonly AvailabilitySort[])
  sortBy?: AvailabilitySort;
}
