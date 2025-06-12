import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Request,
} from "@nestjs/common";
import { ReportersService } from "./reporters.service";
import { CreateReporterDto } from "./dto/create-reporter.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { IResponse } from "../types/index";
import { KycService } from "./kyc.service";
import { GenerateOtpDto, VerifyOtpDto } from "./dto/kyc-verification.dto";
import { ResponseUtil } from "../common/utils/response.util";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";

@ApiTags("👥 Reporters")
@Controller("api/reporters")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class ReportersController {
  constructor(
    private readonly reportersService: ReportersService,
    private readonly kycService: KycService
  ) {}

  @Get()
  @ApiOperation({
    summary: "Get all reporters",
    description:
      "Retrieve list of all reporters with their details and location information.",
  })
  @ApiResponse({
    status: 200,
    description: "Reporters retrieved successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 200 },
        message: {
          type: "string",
          example: "Reporters retrieved successfully",
        },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number", example: 1 },
              level: { type: "string", example: "REPORTER" },
              subscribed: { type: "boolean", example: true },
              user: {
                type: "object",
                properties: {
                  name: { type: "string", example: "John Doe" },
                  phone: { type: "string", example: "9876543210" },
                  email: { type: "string", example: "john@example.com" },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing JWT token",
  })
  async findAll(): Promise<IResponse> {
    return this.reportersService.findAll();
  }

  @Post()
  @ApiOperation({
    summary: "Create reporter profile",
    description:
      "Create a new reporter profile for the authenticated user with location details.",
  })
  @ApiBody({
    type: CreateReporterDto,
    description: "Reporter profile creation details",
    examples: {
      example1: {
        summary: "Create Reporter Profile",
        value: {
          name: "John Doe",
          phone: "9876543210",
          email: "john@example.com",
          level: "REPORTER",
          countryId: 1,
          stateId: 1,
          districtId: 1,
          constituencyId: 1,
          mandalId: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Reporter profile created successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 201 },
        message: {
          type: "string",
          example: "Reporter profile created successfully",
        },
        data: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            level: { type: "string", example: "REPORTER" },
            subscribed: { type: "boolean", example: false },
            userId: { type: "number", example: 1 },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid input data or validation error",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing JWT token",
  })
  async create(
    @Request() req: any,
    @Body() createReporterDto: CreateReporterDto
  ): Promise<IResponse> {
    const reporter = await this.reportersService.create(
      req.user.userId,
      createReporterDto
    );
    return reporter;
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get reporter by ID",
    description: "Retrieve detailed information about a specific reporter.",
  })
  @ApiParam({
    name: "id",
    description: "Reporter ID",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Reporter details retrieved successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 200 },
        message: {
          type: "string",
          example: "Reporter details retrieved successfully",
        },
        data: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            level: { type: "string", example: "REPORTER" },
            subscribed: { type: "boolean", example: true },
            user: {
              type: "object",
              properties: {
                name: { type: "string", example: "John Doe" },
                phone: { type: "string", example: "9876543210" },
                email: { type: "string", example: "john@example.com" },
              },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Reporter not found",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing JWT token",
  })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<IResponse> {
    return this.reportersService.findOne(id);
  }

  @Get(":id/idcard")
  @ApiOperation({
    summary: "Generate reporter ID card",
    description:
      "Generate and retrieve ID card details for a specific reporter.",
  })
  @ApiParam({
    name: "id",
    description: "Reporter ID",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "ID card generated successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 200 },
        message: { type: "string", example: "ID card generated successfully" },
        data: {
          type: "object",
          properties: {
            reporterId: { type: "number", example: 1 },
            name: { type: "string", example: "John Doe" },
            phone: { type: "string", example: "9876543210" },
            level: { type: "string", example: "REPORTER" },
            location: { type: "string", example: "Hyderabad, Telangana" },
            issueDate: { type: "string", example: "2024-01-01" },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Reporter not found",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing JWT token",
  })
  async getIdCardDetails(
    @Param("id", ParseIntPipe) id: number
  ): Promise<IResponse> {
    const idCard = await this.reportersService.getIdCardDetails(id);
    return ResponseUtil.success(idCard, "ID card generated successfully");
  }

  @Post(":id/kyc/generate-otp")
  @ApiOperation({
    summary: "Generate KYC OTP",
    description: "Generate OTP for Aadhaar-based KYC verification of reporter.",
  })
  @ApiParam({
    name: "id",
    description: "Reporter ID",
    example: 1,
    type: "number",
  })
  @ApiBody({
    type: GenerateOtpDto,
    description: "Aadhaar number for KYC verification",
    examples: {
      example1: {
        summary: "Generate KYC OTP",
        value: {
          id_number: "123456789012",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "OTP generated successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 200 },
        message: { type: "string", example: "OTP generated successfully" },
        data: {
          type: "object",
          properties: {
            client_id: { type: "string", example: "client_12345_abcdef" },
            message: {
              type: "string",
              example: "OTP sent to registered mobile number",
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid Aadhaar number or validation error",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 400 },
        message: {
          type: "string",
          example: "Aadhaar number must be exactly 12 digits",
        },
        data: { type: "object", example: {} },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Reporter not found",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 404 },
        message: { type: "string", example: "Reporter not found" },
        data: { type: "object", example: {} },
      },
    },
  })
  async generateKycOtp(
    @Param("id", ParseIntPipe) id: number,
    @Body() generateOtpDto: GenerateOtpDto
  ): Promise<IResponse> {
    return this.kycService.generateOtp(id, generateOtpDto);
  }

  @Post(":id/kyc/verify-otp")
  @ApiOperation({
    summary: "Verify KYC OTP",
    description:
      "Verify OTP for Aadhaar-based KYC verification and complete reporter verification.",
  })
  @ApiParam({
    name: "id",
    description: "Reporter ID",
    example: 1,
    type: "number",
  })
  @ApiBody({
    type: VerifyOtpDto,
    description: "Client ID and OTP for verification",
    examples: {
      example1: {
        summary: "Verify KYC OTP",
        value: {
          client_id: "client_12345_abcdef",
          otp: "123456",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "KYC verification completed successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 200 },
        message: {
          type: "string",
          example: "KYC verification completed successfully",
        },
        data: {
          type: "object",
          properties: {
            verified: { type: "boolean", example: true },
            name: { type: "string", example: "John Doe" },
            aadhaar_number: { type: "string", example: "XXXX-XXXX-9012" },
            verification_date: {
              type: "string",
              example: "2024-01-01T00:00:00Z",
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid OTP or client ID",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 400 },
        message: { type: "string", example: "Invalid or expired OTP" },
        data: { type: "object", example: {} },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Reporter not found",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 404 },
        message: { type: "string", example: "Reporter not found" },
        data: { type: "object", example: {} },
      },
    },
  })
  async verifyKycOtp(
    @Param("id", ParseIntPipe) id: number,
    @Body() verifyOtpDto: VerifyOtpDto
  ): Promise<IResponse> {
    return this.kycService.verifyOtp(id, verifyOtpDto);
  }
}
