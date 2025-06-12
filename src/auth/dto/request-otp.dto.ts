import { IsString, IsNotEmpty, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RequestOtpDto {
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
}
