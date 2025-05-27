import { IsString, Matches } from "class-validator";

export class GenerateOtpDto {
  @IsString()
  @Matches(/^[0-9]{12}$/, {
    message: "Aadhaar number must be exactly 12 digits",
  })
  id_number: string;
}

export class VerifyOtpDto {
  @IsString()
  client_id: string;

  @IsString()
  @Matches(/^[0-9]{6}$/, {
    message: "OTP must be exactly 6 digits",
  })
  otp: string;
}
