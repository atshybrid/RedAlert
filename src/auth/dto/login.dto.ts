import { IsString, Length, IsNotEmpty, Matches } from "class-validator";

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, {
    message: "Phone number must be exactly 10 digits",
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 6, {
    message: "MPIN must be between 4 and 6 characters long",
  })
  mpin: string;
}
