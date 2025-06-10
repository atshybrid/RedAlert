import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { StatesService } from "../services/states.service";
import { CreateStateDto } from "../dto/create-state.dto";
import { UpdateStateDto } from "../dto/update-state.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/roles.guard";
import { Roles } from "../../auth/roles.decorator";
import { Role } from "@prisma/client";
import { IResponse } from "../../types/index";

@Controller("api/locations/states")
@UseGuards(JwtAuthGuard)
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.admin, Role.desk)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStateDto: CreateStateDto): Promise<IResponse> {
    return this.statesService.create(createStateDto);
  }

  @Get()
  async findAll(@Query("countryId") countryId?: string): Promise<IResponse> {
    const countryIdNum = countryId ? parseInt(countryId, 10) : undefined;
    return this.statesService.findAll(countryIdNum);
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<IResponse> {
    return this.statesService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.admin, Role.desk)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateStateDto: UpdateStateDto
  ): Promise<IResponse> {
    return this.statesService.update(id, updateStateDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  async remove(@Param("id", ParseIntPipe) id: number): Promise<IResponse> {
    return this.statesService.remove(id);
  }
}

// Alternative nested route controller for countries/{id}/states
@Controller("api/locations/countries/:countryId/states")
@UseGuards(JwtAuthGuard)
export class CountryStatesController {
  constructor(private readonly statesService: StatesService) {}

  @Get()
  async findStatesByCountry(
    @Param("countryId", ParseIntPipe) countryId: number
  ): Promise<IResponse> {
    return this.statesService.findAll(countryId);
  }
}
