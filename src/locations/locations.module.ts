import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";

// Services
import { CountriesService } from "./services/countries.service";
import { StatesService } from "./services/states.service";
import { DistrictsService } from "./services/districts.service";
import { ConstituenciesService } from "./services/constituencies.service";
import { MandalsService } from "./services/mandals.service";

// Controllers
import { CountriesController } from "./controllers/countries.controller";
import {
  StatesController,
  CountryStatesController,
} from "./controllers/states.controller";
import {
  DistrictsController,
  StateDistrictsController,
} from "./controllers/districts.controller";
import {
  ConstituenciesController,
  DistrictConstituenciesController,
} from "./controllers/constituencies.controller";
import {
  MandalsController,
  ConstituencyMandalsController,
} from "./controllers/mandals.controller";

@Module({
  imports: [PrismaModule],
  controllers: [
    CountriesController,
    StatesController,
    CountryStatesController,
    DistrictsController,
    StateDistrictsController,
    ConstituenciesController,
    DistrictConstituenciesController,
    MandalsController,
    ConstituencyMandalsController,
  ],
  providers: [
    CountriesService,
    StatesService,
    DistrictsService,
    ConstituenciesService,
    MandalsService,
  ],
  exports: [
    CountriesService,
    StatesService,
    DistrictsService,
    ConstituenciesService,
    MandalsService,
  ],
})
export class LocationsModule {}
