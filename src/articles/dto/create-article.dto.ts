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
