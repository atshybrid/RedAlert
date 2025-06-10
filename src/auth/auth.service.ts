import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RequestOtpDto } from "./dto/request-otp.dto";
import { SetMpinDto } from "./dto/set-mpin.dto";
import { CheckMpinDto } from "./dto/check-mpin.dto";
import { WhatsappService } from "../utility/whatsapp.service";
import { JwtService } from "./jwt.service";
import { Role, UserStatus } from "@prisma/client";
import { IResponse } from "../types/index";
import { ResponseUtil } from "../common/utils/response.util";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto): Promise<IResponse> {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: { phone: dto.phone },
      });

      if (existingUser) {
        return ResponseUtil.error(
          "User already exists with this phone number",
          409
        );
      }

      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          role: Role.reporter,
          status: UserStatus.active,
        },
      });

      return ResponseUtil.success(
        {
          userId: user.id,
          phone: user.phone,
          name: user.name,
        },
        "User registered successfully",
        201
      );
    } catch (error) {
      this.logger.error("Failed to register user", error.stack);
      return ResponseUtil.error("Failed to register user", 500);
    }
  }

  async login(dto: LoginDto): Promise<IResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
        include: {
          reporter: true,
        },
      });

      if (!user) {
        return ResponseUtil.error("Invalid credentials", 401);
      }

      if (!user.mpin) {
        return ResponseUtil.error("MPIN not set", 401);
      }

      const isValidMpin = await bcrypt.compare(dto.mpin, user.mpin);
      if (!isValidMpin) {
        return ResponseUtil.error("Invalid MPIN", 401);
      }

      const token = await this.jwtService.generateToken({
        userId: user.id,
        phone: user.phone,
        role: user.role,
      });
      return ResponseUtil.success({ ...user, token }, "Login successful", 200);
    } catch (error) {
      this.logger.error("Failed to login", error.stack);
      return ResponseUtil.error("Failed to login", 500);
    }
  }

  async requestOtp(dto: RequestOtpDto): Promise<IResponse> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { phone: dto.phone },
      });

      if (!user) {
        return ResponseUtil.error("User not found", 404);
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await this.prisma.otp_log.create({
        data: {
          phone: dto.phone,
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      const sent = await this.whatsappService.sendOtp(dto.phone, otp);
      if (!sent) {
        return ResponseUtil.error("Failed to send OTP via WhatsApp", 400);
      }

      return ResponseUtil.success(
        {},
        "OTP sent successfully via WhatsApp",
        200
      );
    } catch (error) {
      this.logger.error("Failed to send OTP", error.stack);
      return ResponseUtil.error("Failed to send OTP", 500);
    }
  }

  private async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const otpRecord = await this.prisma.otp_log.findFirst({
      where: {
        phone,
        otp,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return false;
    }

    // Delete used OTP
    await this.prisma.otp_log.delete({
      where: { id: otpRecord.id },
    });

    return true;
  }

  async setMpin(dto: SetMpinDto): Promise<IResponse> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { phone: dto.phone },
      });

      if (!user) {
        return ResponseUtil.error("User not found", 404);
      }

      const otpRecord = await this.prisma.otp_log.findFirst({
        where: {
          phone: dto.phone,
          otp: dto.otp,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!otpRecord) {
        return ResponseUtil.error("Invalid or expired OTP", 400);
      }

      const hashedMpin = await bcrypt.hash(dto.mpin, 10);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { mpin: hashedMpin },
      });

      return ResponseUtil.success({}, "MPIN set successfully", 200);
    } catch (error) {
      this.logger.error("Failed to set MPIN", error.stack);
      return ResponseUtil.error("Failed to set MPIN", 500);
    }
  }

  async checkMpin(dto: CheckMpinDto): Promise<IResponse> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { phone: dto.phone },
      });

      if (!user) {
        return ResponseUtil.error("User not found", 404);
      }

      return ResponseUtil.success(
        { mpinSet: !!user.mpin },
        "MPIN status retrieved successfully",
        200
      );
    } catch (error) {
      this.logger.error("Failed to check MPIN status", error.stack);
      return ResponseUtil.error("Failed to check MPIN status", 500);
    }
  }
}
