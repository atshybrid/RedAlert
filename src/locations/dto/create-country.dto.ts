import { IsString, IsOptional, MinLength, MaxLength } from "class-validator";

export class CreateCountryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;
}
