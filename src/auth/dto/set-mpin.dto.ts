import { IsString, IsNotEmpty, Length, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SetMpinDto {
  @ApiProperty({
    description: "10-digit phone number (Indian format)",
    example: "9876543210",
    pattern: "^[0-9]{10}$",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, {
    message: "Phone number must be exactly 10 digits",
  })
  phone: string;

  @ApiProperty({
    description: "Mobile PIN for authentication (4-6 digits)",
    example: "123456",
    minLength: 4,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 6, {
    message: "MPIN must be between 4 and 6 characters long",
  })
  mpin: string;

  @ApiProperty({
    description: "OTP received via WhatsApp (6 digits)",
    example: "123456",
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
