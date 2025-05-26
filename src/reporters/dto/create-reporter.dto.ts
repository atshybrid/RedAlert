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

export enum ReporterLevel {
  BUREAU_REPORTER = "BUREAU_REPORTER",
  STAFF_REPORTER = "STAFF_REPORTER",
  CRIME_REPORTER = "CRIME_REPORTER",
  RC_INCHARGE = "RC_INCHARGE",
  REPORTER = "REPORTER",
}

export class CreateReporterDto {
  @IsNotEmpty()
  @IsString()
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

  @IsEnum(ReporterLevel, {
    message:
      "Level must be one of: BUREAU_REPORTER, STAFF_REPORTER, CRIME_REPORTER, RC_INCHARGE, REPORTER",
  })
  level: ReporterLevel;

  @IsInt()
  @IsOptional()
  parentId?: number;

  @IsInt()
  countryId: number;

  @IsInt()
  stateId: number;

  @IsInt()
  @IsOptional()
  districtId?: number;

  @IsInt()
  @IsOptional()
  constituencyId?: number;

  @IsInt()
  @IsOptional()
  mandalId?: number;

  // Payment Details (from reporter model)
  @IsNumber()
  @IsOptional()
  joiningFee?: number;

  @IsNumber()
  @IsOptional()
  monthlyFee?: number;

  // Additional Settings (from reporter model)
  @IsBoolean()
  @IsOptional()
  autoLive?: boolean;

  @IsUrl()
  @IsOptional()
  profilePhotoUrl?: string;
}
