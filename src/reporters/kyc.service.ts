import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { GenerateOtpDto, VerifyOtpDto } from "./dto/kyc-verification.dto";
import { firstValueFrom } from "rxjs";
import { IResponse } from "../types/index";
import { ResponseUtil } from "../common/utils/response.util";

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);
  private readonly baseUrl: string;
  private readonly authToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.authToken = this.configService.get<string>("KYC_AUTH_TOKEN");
    this.baseUrl = this.configService.get<string>("KYC_URL");
    if (!this.authToken) {
      this.logger.error("KYC_AUTH_TOKEN is not configured");
    }
  }

  async generateOtp(
    reporterId: number,
    dto: GenerateOtpDto
  ): Promise<IResponse> {
    try {
      console.log(reporterId, "reporterIdreporterId");
      const reporter = await this.prisma.reporter.findUnique({
        where: { id: reporterId },
      });

      if (!reporter) {
        return ResponseUtil.error("Reporter not found", 404);
      }

      // if (reporter.kyc_verification) {
      //   return ResponseUtil.error("KYC already verified", 400);
      // }

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/generate-otp`,
          { id_number: dto.id_number },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.authToken}`,
            },
          }
        )
      );

      return ResponseUtil.success(
        response.data.data,
        "OTP generated successfully"
      );
    } catch (error) {
      this.logger.error("Failed to generate OTP", error.stack);
      if (error.response) {
        return ResponseUtil.error(
          error.response.data.message || "Failed to generate OTP",
          error.response.status
        );
      }
      return ResponseUtil.error("Failed to generate OTP", 500);
    }
  }

  async verifyOtp(reporterId: number, dto: VerifyOtpDto): Promise<IResponse> {
    try {
      const reporter = await this.prisma.reporter.findUnique({
        where: { id: reporterId },
      });

      if (!reporter) {
        return ResponseUtil.error("Reporter not found", 404);
      }

      // if (reporter.kyc_verification) {
      //   return ResponseUtil.error("KYC already verified", 400);
      // }

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/submit-otp`,
          {
            client_id: dto.client_id,
            otp: dto.otp,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.authToken}`,
            },
          }
        )
      );

      // Update reporter with KYC data
      await this.prisma.reporter.update({
        where: { id: reporterId },
        data: {
          kyc_verification: true,
          kyc_data: response.data.data,
        },
      });

      return ResponseUtil.success(
        { verified: true },
        "KYC verification successful"
      );
    } catch (error) {
      this.logger.error("Failed to verify OTP", error.stack);
      if (error.response) {
        return ResponseUtil.error(
          error.response.data.message || "Failed to verify OTP",
          error.response.status
        );
      }
      return ResponseUtil.error("Failed to verify OTP", 500);
    }
  }
}
