import { Module } from "@nestjs/common";
import { ReportersController } from "./reporters.controller";
import { ReportersService } from "./reporters.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ReportersController],
  providers: [ReportersService],
  exports: [ReportersService],
})
export class ReportersModule {}
