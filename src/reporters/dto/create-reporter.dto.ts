import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsUrl,
  Length,
  Matches,
  IsEmail,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum ReporterLevel {
  BUREAU_REPORTER = "BUREAU_REPORTER",
  STAFF_REPORTER = "STAFF_REPORTER",
  CRIME_REPORTER = "CRIME_REPORTER",
  RC_INCHARGE = "RC_INCHARGE",
  REPORTER = "REPORTER",
}

export class CreateReporterDto {
  @ApiProperty({
    description: "Reporter's full name",
    example: "John Doe",
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
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

  @ApiProperty({
    description: "Reporter level/designation",
    example: "REPORTER",
    enum: ReporterLevel,
  })
  @IsEnum(ReporterLevel, {
    message:
      "Level must be one of: BUREAU_REPORTER, STAFF_REPORTER, CRIME_REPORTER, RC_INCHARGE, REPORTER",
  })
  level: ReporterLevel;

  @ApiProperty({
    description: "Parent reporter ID (optional)",
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  parentId?: number;

  @ApiProperty({
    description: "Parent user ID (optional)",
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  parentUserId?: number;

  @ApiProperty({
    description: "Country ID",
    example: 1,
  })
  @IsInt()
  countryId: number;

  @ApiProperty({
    description: "State ID",
    example: 1,
  })
  @IsInt()
  stateId: number;

  @ApiProperty({
    description: "District ID (optional)",
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  districtId?: number;

  @ApiProperty({
    description: "Constituency ID (optional)",
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  constituencyId?: number;

  @ApiProperty({
    description: "Mandal ID (optional)",
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  mandalId?: number;

  // Payment Details (from reporter model)
  @ApiProperty({
    description: "One-time joining fee amount",
    example: 1000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  joiningFee?: number;

  @ApiProperty({
    description: "Monthly subscription fee amount",
    example: 500,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  monthlyFee?: number;

  // Additional Settings (from reporter model)
  @ApiProperty({
    description: "Auto-publish articles without approval",
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  autoLive?: boolean;

  @ApiProperty({
    description: "URL to reporter's profile photo",
    example: "https://example.com/profile.jpg",
    required: false,
  })
  @IsUrl()
  @IsOptional()
  profilePhotoUrl?: string;
}
