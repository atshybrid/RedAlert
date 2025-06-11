import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UtilityModule } from "./utility/utility.module";
import { ReportersModule } from "./reporters/reporters.module";
import { ArticlesModule } from "./articles/articles.module";
import { PaymentsModule } from "./payments/payments.module";
import { LocationsModule } from "./locations/locations.module";
console.log("Updated code check");
@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    PrismaModule,
    AuthModule,
    UtilityModule,
    ReportersModule,
    ArticlesModule,
    PaymentsModule,
    LocationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
