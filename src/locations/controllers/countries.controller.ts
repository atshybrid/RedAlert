import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CountriesService } from "../services/countries.service";
import { CreateCountryDto } from "../dto/create-country.dto";
import { UpdateCountryDto } from "../dto/update-country.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/roles.guard";
import { Roles } from "../../auth/roles.decorator";
import { Role } from "@prisma/client";
import { IResponse } from "../../types/index";

@Controller("api/locations/countries")
@UseGuards(JwtAuthGuard)
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.admin, Role.desk)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCountryDto: CreateCountryDto): Promise<IResponse> {
    return this.countriesService.create(createCountryDto);
  }

  @Get()
  async findAll(): Promise<IResponse> {
    return this.countriesService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<IResponse> {
    return this.countriesService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.admin, Role.desk)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCountryDto: UpdateCountryDto
  ): Promise<IResponse> {
    return this.countriesService.update(id, updateCountryDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.admin)
  async remove(@Param("id", ParseIntPipe) id: number): Promise<IResponse> {
    return this.countriesService.remove(id);
  }
}
