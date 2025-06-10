import { IsString, IsNumber, IsOptional, MinLength, MaxLength, IsPositive } from "class-validator";

export class CreateStateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;

  @IsNumber()
  @IsPositive()
  countryId: number;
}
