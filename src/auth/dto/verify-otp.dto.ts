import { IsString, IsNotEmpty, Matches } from "class-validator";

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, {
    message: "Phone number must be exactly 10 digits",
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
