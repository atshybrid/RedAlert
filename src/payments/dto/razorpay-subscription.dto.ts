import { IsNumber, IsString, IsOptional } from "class-validator";

export class RazorpaySubscriptionDto {
  @IsNumber()
  amount: number;

  @IsNumber()
  period: number;

  @IsString()
  @IsOptional()
  notes?: string;

  reporterId?: number;
}
