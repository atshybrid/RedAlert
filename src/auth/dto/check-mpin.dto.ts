import { IsString } from "class-validator";

export class CheckMpinDto {
  @IsString() phone: string;
}
