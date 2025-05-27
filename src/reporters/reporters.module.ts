import { Module } from "@nestjs/common";
import { ReportersController } from "./reporters.controller";
import { ReportersService } from "./reporters.service";
import { PrismaModule } from "../prisma/prisma.module";
import { HttpModule } from "@nestjs/axios";
import { KycService } from "./kyc.service";

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [ReportersController],
  providers: [ReportersService, KycService],
  exports: [ReportersService],
})
export class ReportersModule {}
