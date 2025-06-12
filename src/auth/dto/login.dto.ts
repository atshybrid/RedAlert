import { IsString, Length, IsNotEmpty, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
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
}
