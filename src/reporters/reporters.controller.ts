import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  Request,
} from "@nestjs/common";
import { ReportersService } from "./reporters.service";
import { CreateReporterDto } from "./dto/create-reporter.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { IResponse } from "../types";

@Controller("api/reporters")
@UseGuards(JwtAuthGuard)
export class ReportersController {
  constructor(private readonly reportersService: ReportersService) {}

  @Get()
  async findAll(): Promise<IResponse> {
    const reporters = await this.reportersService.findAll();
    return {
      message: "Reporters retrieved successfully",
      statusCode: HttpStatus.OK,
      success: true,
      data: reporters,
    };
  }

  @Post()
  async create(
    @Request() req,
    @Body() createReporterDto: CreateReporterDto
  ): Promise<IResponse> {
    const reporter = await this.reportersService.create(
      req.user.userId,
      createReporterDto
    );
    return {
      message: "Reporter created successfully",
      statusCode: HttpStatus.CREATED,
      success: true,
      data: reporter,
    };
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<IResponse> {
    const reporter = await this.reportersService.findOne(id);
    return {
      message: "Reporter retrieved successfully",
      statusCode: HttpStatus.OK,
      success: true,
      data: reporter,
    };
  }

  @Get(":id/idcard")
  async getIdCardDetails(
    @Param("id", ParseIntPipe) id: number
  ): Promise<IResponse> {
    const idCard = await this.reportersService.getIdCardDetails(id);
    return {
      message: "ID card generated successfully",
      statusCode: HttpStatus.OK,
      success: true,
      data: idCard,
    };
  }
}
