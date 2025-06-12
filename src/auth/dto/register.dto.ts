import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Matches,
  Length,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({
    description: "Full name of the user",
    example: "John Doe",
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

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
    description: "Email address (optional)",
    example: "john.doe@example.com",
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
