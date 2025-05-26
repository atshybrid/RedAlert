import {
  IsString,
  IsOptional,
  IsNumber,
  IsLatitude,
  IsLongitude,
  IsArray,
  MinLength,
  MaxLength,
  IsUrl,
  IsEnum,
  ValidateIf,
  IsNotEmpty,
} from "class-validator";
import { Role } from "@prisma/client";

export class CreateArticleDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  content: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  languageCode: string;

  // SEO Fields (mandatory)
  @IsString()
  @MinLength(50)
  @MaxLength(160)
  metaDescription: string;

  @IsString()
  @MinLength(3)
  @MaxLength(60)
  metaTitle: string;

  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  // Location fields - required for citizen posts
  @ValidateIf((o) => !o.countryId && !o.stateId)
  @IsLatitude()
  latitude?: number;

  @ValidateIf((o) => !o.countryId && !o.stateId)
  @IsLongitude()
  longitude?: number;

  // Location fields - required for desk team
  @ValidateIf((o) => o.role === Role.desk)
  @IsNumber()
  countryId?: number;

  @ValidateIf((o) => o.role === Role.desk)
  @IsNumber()
  stateId?: number;

  @IsNumber()
  @IsOptional()
  districtId?: number;

  @IsNumber()
  @IsOptional()
  constituencyId?: number;

  @IsOptional()
  isLive?: boolean;

  @IsNumber()
  @IsOptional()
  mandalId?: number;

  @IsString()
  @IsOptional()
  villageName?: string;
}
