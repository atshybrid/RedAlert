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
import { IResponse } from "../types/index";
import { KycService } from "./kyc.service";
import { GenerateOtpDto, VerifyOtpDto } from "./dto/kyc-verification.dto";
import { ResponseUtil } from "../common/utils/response.util";

@Controller("api/reporters")
@UseGuards(JwtAuthGuard)
export class ReportersController {
  constructor(
    private readonly reportersService: ReportersService,
    private readonly kycService: KycService
  ) {}

  @Get()
  async findAll(): Promise<IResponse> {
    return this.reportersService.findAll();
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
    return reporter;
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<IResponse> {
    return this.reportersService.findOne(id);
  }

  @Get(":id/idcard")
  async getIdCardDetails(
    @Param("id", ParseIntPipe) id: number
  ): Promise<IResponse> {
    const idCard = await this.reportersService.getIdCardDetails(id);
    return ResponseUtil.success(idCard, "ID card generated successfully");
  }

  @Post(":id/kyc/generate-otp")
  async generateKycOtp(
    @Param("id", ParseIntPipe) id: number,
    @Body() generateOtpDto: GenerateOtpDto
  ): Promise<IResponse> {
    return this.kycService.generateOtp(id, generateOtpDto);
  }

  @Post(":id/kyc/verify-otp")
  async verifyKycOtp(
    @Param("id", ParseIntPipe) id: number,
    @Body() verifyOtpDto: VerifyOtpDto
  ): Promise<IResponse> {
    return this.kycService.verifyOtp(id, verifyOtpDto);
  }
}
