import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

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
}
