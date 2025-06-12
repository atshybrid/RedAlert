import { IsNumber, IsString, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RazorpaySubscriptionDto {
  @ApiProperty({
    description: "Subscription amount in paise (1 rupee = 100 paise)",
    example: 50000,
    minimum: 100,
  })
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiProperty({
    description: "Subscription period in months",
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  period: number;

  @ApiProperty({
    description: "Additional notes for the subscription",
    example: "Monthly subscription for reporter",
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  reporterId?: number;
}
