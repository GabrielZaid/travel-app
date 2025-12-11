import {
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsBooleanString,
} from 'class-validator';

export class CheapestDateDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  origin!: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  destination!: string;

  @IsOptional()
  @IsBooleanString()
  nonStop?: string;

  @IsOptional()
  @IsBooleanString()
  oneWay?: string;
}
