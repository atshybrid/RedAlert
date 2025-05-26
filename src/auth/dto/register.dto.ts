import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Matches,
  Length,
} from "class-validator";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, {
    message: "Phone number must be exactly 10 digits",
  })
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
