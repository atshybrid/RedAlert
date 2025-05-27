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
  Matches,
} from "class-validator";
import { Role } from "@prisma/client";

// Supported language codes
export enum LanguageCode {
  EN = "en", // English
  HI = "hi", // Hindi
  TE = "te", // Telugu
  TA = "ta", // Tamil
  ML = "ml", // Malayalam
  KN = "kn", // Kannada
  BN = "bn", // Bengali
  MR = "mr", // Marathi
  GU = "gu", // Gujarati
  PA = "pa", // Punjabi
  OR = "or", // Odia
  UR = "ur", // Urdu
}

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

  @IsNotEmpty()
  @IsEnum(LanguageCode, {
    message:
      "Invalid language code. Must be one of: en, gu, hi, te, ta, ml, kn, ar",
  })
  languageCode: LanguageCode;

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

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  stateId?: number;

  @IsOptional()
  @IsNumber()
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
