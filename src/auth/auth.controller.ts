import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RequestOtpDto } from "./dto/request-otp.dto";
import { SetMpinDto } from "./dto/set-mpin.dto";
import { CheckMpinDto } from "./dto/check-mpin.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";

@ApiTags("🔐 Authentication")
@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Register a new user",
    description:
      "Create a new user account with phone number, name, and email. User will be created with inactive status until MPIN is set.",
  })
  @ApiBody({
    type: RegisterDto,
    description: "User registration details",
    examples: {
      example1: {
        summary: "Standard Registration",
        value: {
          name: "John Doe",
          phone: "9876543210",
          email: "john.doe@example.com",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "User registered successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 201 },
        message: { type: "string", example: "User registered successfully" },
        data: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            name: { type: "string", example: "John Doe" },
            phone: { type: "string", example: "9876543210" },
            email: { type: "string", example: "john.doe@example.com" },
            status: { type: "string", example: "inactive" },
            role: { type: "string", example: "reporter" },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid input data or user already exists",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 400 },
        message: {
          type: "string",
          example: "User already exists with this phone number",
        },
        data: { type: "object", example: {} },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: "Internal server error",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 500 },
        message: { type: "string", example: "Failed to register user" },
        data: { type: "object", example: {} },
      },
    },
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "User login",
    description:
      "Authenticate user with phone number and MPIN. Returns JWT token for authorized access.",
  })
  @ApiBody({
    type: LoginDto,
    description: "User login credentials",
    examples: {
      example1: {
        summary: "Standard Login",
        value: {
          phone: "9876543210",
          mpin: "123456",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 200 },
        message: { type: "string", example: "Login successful" },
        data: {
          type: "object",
          properties: {
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: {
              type: "object",
              properties: {
                id: { type: "number", example: 1 },
                name: { type: "string", example: "John Doe" },
                phone: { type: "string", example: "9876543210" },
                email: { type: "string", example: "john.doe@example.com" },
                role: { type: "string", example: "reporter" },
                status: { type: "string", example: "active" },
              },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Invalid credentials or inactive account",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 401 },
        message: { type: "string", example: "Invalid MPIN" },
        data: { type: "object", example: {} },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Missing or invalid input data",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 400 },
        message: { type: "string", example: "MPIN not set" },
        data: { type: "object", example: {} },
      },
    },
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("request-otp")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Request OTP for phone verification",
    description:
      "Send OTP to the provided phone number via WhatsApp for verification purposes.",
  })
  @ApiBody({
    type: RequestOtpDto,
    description: "Phone number for OTP request",
    examples: {
      example1: {
        summary: "Request OTP",
        value: {
          phone: "9876543210",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "OTP sent successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 200 },
        message: { type: "string", example: "OTP sent successfully" },
        data: { type: "object", example: {} },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid phone number",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 400 },
        message: {
          type: "string",
          example: "Phone number must be exactly 10 digits",
        },
        data: { type: "object", example: {} },
      },
    },
  })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  @Post("set-mpin")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Set MPIN for user account",
    description:
      "Set Mobile PIN for user account using OTP verification. This activates the user account.",
  })
  @ApiBody({
    type: SetMpinDto,
    description: "MPIN setup details with OTP verification",
    examples: {
      example1: {
        summary: "Set MPIN",
        value: {
          phone: "9876543210",
          otp: "123456",
          mpin: "654321",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "MPIN set successfully and account activated",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 200 },
        message: { type: "string", example: "MPIN set successfully" },
        data: { type: "object", example: {} },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid OTP or validation error",
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
  async setMpin(@Body() dto: SetMpinDto) {
    return this.authService.setMpin(dto);
  }

  @Post("check-mpin")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Check MPIN status",
    description: "Check if user has set MPIN for their account.",
  })
  @ApiBody({
    type: CheckMpinDto,
    description: "Phone number to check MPIN status",
    examples: {
      example1: {
        summary: "Check MPIN Status",
        value: {
          phone: "9876543210",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "MPIN status retrieved successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 200 },
        message: { type: "string", example: "MPIN status retrieved" },
        data: {
          type: "object",
          properties: {
            hasMpin: { type: "boolean", example: true },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "User not found",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 404 },
        message: { type: "string", example: "User not found" },
        data: { type: "object", example: {} },
      },
    },
  })
  async checkMpin(@Body() dto: CheckMpinDto) {
    return this.authService.checkMpin(dto);
  }
}
