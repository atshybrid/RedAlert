import { IsString, IsNumber, MinLength, MaxLength, IsPositive } from "class-validator";

export class CreateMandalDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsNumber()
  @IsPositive()
  constituencyId: number;
}
