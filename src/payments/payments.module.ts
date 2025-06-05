import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module";
import { RazorpayService } from "./services/razorpay.service";
import { RazorpayController } from "./controllers/razorpay.controller";

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [RazorpayController],
  providers: [RazorpayService],
  exports: [RazorpayService],
})
export class PaymentsModule {}
