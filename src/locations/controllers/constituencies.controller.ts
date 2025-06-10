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
import { ConstituenciesService } from "../services/constituencies.service";
import { CreateConstituencyDto } from "../dto/create-constituency.dto";
import { UpdateConstituencyDto } from "../dto/update-constituency.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/roles.guard";
import { Roles } from "../../auth/roles.decorator";
import { Role } from "@prisma/client";
import { IResponse } from "../../types/index";

@Controller("api/locations/constituencies")
@UseGuards(JwtAuthGuard)
export class ConstituenciesController {
  constructor(private readonly constituenciesService: ConstituenciesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.admin, Role.desk)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createConstituencyDto: CreateConstituencyDto): Promise<IResponse> {
    return this.constituenciesService.create(createConstituencyDto);
  }

  @Get()
  async findAll(@Query("districtId") districtId?: string): Promise<IResponse> {
    const districtIdNum = districtId ? parseInt(districtId, 10) : undefined;
    return this.constituenciesService.findAll(districtIdNum);
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<IResponse> {
    return this.constituenciesService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.admin, Role.desk)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateConstituencyDto: UpdateConstituencyDto
  ): Promise<IResponse> {
    return this.constituenciesService.update(id, updateConstituencyDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  async remove(@Param("id", ParseIntPipe) id: number): Promise<IResponse> {
    return this.constituenciesService.remove(id);
  }
}

// Alternative nested route controller for districts/{id}/constituencies
@Controller("api/locations/districts/:districtId/constituencies")
@UseGuards(JwtAuthGuard)
export class DistrictConstituenciesController {
  constructor(private readonly constituenciesService: ConstituenciesService) {}

  @Get()
  async findConstituenciesByDistrict(
    @Param("districtId", ParseIntPipe) districtId: number
  ): Promise<IResponse> {
    return this.constituenciesService.findAll(districtId);
  }
}
