import { IsString, IsNotEmpty, Matches } from "class-validator";

export class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, {
    message: "Phone number must be exactly 10 digits",
  })
  phone: string;
}
