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
import { MandalsService } from "../services/mandals.service";
import { CreateMandalDto } from "../dto/create-mandal.dto";
import { UpdateMandalDto } from "../dto/update-mandal.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/roles.guard";
import { Roles } from "../../auth/roles.decorator";
import { Role } from "@prisma/client";
import { IResponse } from "../../types/index";

@Controller("api/locations/mandals")
@UseGuards(JwtAuthGuard)
export class MandalsController {
  constructor(private readonly mandalsService: MandalsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.admin, Role.desk)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMandalDto: CreateMandalDto): Promise<IResponse> {
    return this.mandalsService.create(createMandalDto);
  }

  @Get()
  async findAll(@Query("constituencyId") constituencyId?: string): Promise<IResponse> {
    const constituencyIdNum = constituencyId ? parseInt(constituencyId, 10) : undefined;
    return this.mandalsService.findAll(constituencyIdNum);
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<IResponse> {
    return this.mandalsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.admin, Role.desk)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateMandalDto: UpdateMandalDto
  ): Promise<IResponse> {
    return this.mandalsService.update(id, updateMandalDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  async remove(@Param("id", ParseIntPipe) id: number): Promise<IResponse> {
    return this.mandalsService.remove(id);
  }
}

// Alternative nested route controller for constituencies/{id}/mandals
@Controller("api/locations/constituencies/:constituencyId/mandals")
@UseGuards(JwtAuthGuard)
export class ConstituencyMandalsController {
  constructor(private readonly mandalsService: MandalsService) {}

  @Get()
  async findMandalsByConstituency(
    @Param("constituencyId", ParseIntPipe) constituencyId: number
  ): Promise<IResponse> {
    return this.mandalsService.findAll(constituencyId);
  }
}
