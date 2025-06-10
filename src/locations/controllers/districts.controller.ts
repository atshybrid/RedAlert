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
import { DistrictsService } from "../services/districts.service";
import { CreateDistrictDto } from "../dto/create-district.dto";
import { UpdateDistrictDto } from "../dto/update-district.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/roles.guard";
import { Roles } from "../../auth/roles.decorator";
import { Role } from "@prisma/client";
import { IResponse } from "../../types/index";

@Controller("api/locations/districts")
@UseGuards(JwtAuthGuard)
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.admin, Role.desk)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDistrictDto: CreateDistrictDto): Promise<IResponse> {
    return this.districtsService.create(createDistrictDto);
  }

  @Get()
  async findAll(@Query("stateId") stateId?: string): Promise<IResponse> {
    const stateIdNum = stateId ? parseInt(stateId, 10) : undefined;
    return this.districtsService.findAll(stateIdNum);
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<IResponse> {
    return this.districtsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.admin, Role.desk)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDistrictDto: UpdateDistrictDto
  ): Promise<IResponse> {
    return this.districtsService.update(id, updateDistrictDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  async remove(@Param("id", ParseIntPipe) id: number): Promise<IResponse> {
    return this.districtsService.remove(id);
  }
}

// Alternative nested route controller for states/{id}/districts
@Controller("api/locations/states/:stateId/districts")
@UseGuards(JwtAuthGuard)
export class StateDistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Get()
  async findDistrictsByState(
    @Param("stateId", ParseIntPipe) stateId: number
  ): Promise<IResponse> {
    return this.districtsService.findAll(stateId);
  }
}
