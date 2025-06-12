import { IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GenerateOtpDto {
  @ApiProperty({
    description: "12-digit Aadhaar number for KYC verification",
    example: "123456789012",
    pattern: "^[0-9]{12}$",
    minLength: 12,
    maxLength: 12,
  })
  @IsString()
  @Matches(/^[0-9]{12}$/, {
    message: "Aadhaar number must be exactly 12 digits",
  })
  id_number: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: "Client ID received from the generate OTP response",
    example: "client_12345_abcdef",
  })
  @IsString()
  client_id: string;

  @ApiProperty({
    description: "6-digit OTP received for Aadhaar verification",
    example: "123456",
    pattern: "^[0-9]{6}$",
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Matches(/^[0-9]{6}$/, {
    message: "OTP must be exactly 6 digits",
  })
  otp: string;
}
