import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  Logger,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RazorpayService } from "../services/razorpay.service";
import { RazorpaySubscriptionDto } from "../dto/razorpay-subscription.dto";
import { IResponse } from "../../types/index";
import { ResponseUtil } from "../../common/utils/response.util";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";

@ApiTags("💳 Payments")
@Controller("payments/razorpay")
export class RazorpayController {
  private readonly logger = new Logger(RazorpayController.name);

  constructor(private readonly razorpayService: RazorpayService) {}

  @Post("subscription")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Create subscription for authenticated reporter",
    description:
      "Create a new Razorpay subscription for the authenticated reporter. Requires valid JWT token.",
  })
  @ApiBody({
    type: RazorpaySubscriptionDto,
    description: "Subscription details",
    examples: {
      example1: {
        summary: "Monthly Subscription",
        value: {
          amount: 50000,
          period: 1,
          notes: "Monthly subscription for reporter",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Subscription created successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 201 },
        message: {
          type: "string",
          example: "Subscription created successfully",
        },
        data: {
          type: "object",
          properties: {
            id: { type: "string", example: "sub_1234567890" },
            plan_id: { type: "string", example: "plan_1234567890" },
            status: { type: "string", example: "created" },
            current_start: { type: "number", example: 1640995200 },
            current_end: { type: "number", example: 1643673600 },
            total_count: { type: "number", example: 12 },
            short_url: { type: "string", example: "https://rzp.io/i/abc123" },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing JWT token",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 401 },
        message: { type: "string", example: "Unauthorized" },
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
  @ApiInternalServerErrorResponse({
    description: "Failed to create subscription",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 500 },
        message: { type: "string", example: "Failed to create subscription" },
        data: { type: "object", example: {} },
      },
    },
  })
  async createSubscription(
    @Request() req: any,
    @Body() dto: RazorpaySubscriptionDto
  ): Promise<IResponse> {
    try {
      const reporterId = req.user.userId;
      if (!reporterId) {
        return ResponseUtil.error("Reporter not found", 404);
      }

      // Create a plan first
      const plan = await this.razorpayService.createPlan({
        ...dto,
        reporterId,
      });

      // Create subscription with the plan
      return this.razorpayService.createSubscription(plan.id);
    } catch (error) {
      return ResponseUtil.error(
        "Failed to create subscription",
        error.statusCode || 500
      );
    }
  }

  @ApiBody({
    description: "Guest subscription details",
    schema: {
      type: "object",
      required: ["phone", "name", "amount", "period"],
      properties: {
        phone: {
          type: "string",
          example: "9876543210",
          pattern: "^[0-9]{10}$",
        },
        name: { type: "string", example: "Guest User", minLength: 2 },
        amount: { type: "number", example: 50000, minimum: 1 },
        period: { type: "number", example: 1, minimum: 1 },
      },
    },
    examples: {
      example1: {
        summary: "Guest Monthly Subscription",
        value: {
          phone: "9876543210",
          name: "Guest User",
          amount: 50000,
          period: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Guest subscription created successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 201 },
        message: {
          type: "string",
          example: "Guest subscription created successfully",
        },
        data: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                id: { type: "number", example: 1 },
                name: { type: "string", example: "Guest User" },
                phone: { type: "string", example: "9876543210" },
                status: { type: "string", example: "inactive" },
              },
            },
            subscription: {
              type: "object",
              properties: {
                id: { type: "string", example: "sub_1234567890" },
                status: { type: "string", example: "created" },
                plan_id: { type: "string", example: "plan_1234567890" },
              },
            },
            paymentUrl: { type: "string", example: "https://rzp.io/i/abc123" },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Invalid input data",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 400 },
        message: {
          type: "string",
          example: "Valid 10-digit phone number is required",
        },
        data: { type: "object", example: {} },
      },
    },
  })
  async createGuestSubscription(
    @Body() dto: { phone: string; name: string; amount: number; period: number }
  ): Promise<IResponse> {
    try {
      // Validate input
      if (!dto.phone || !/^\d{10}$/.test(dto.phone)) {
        return ResponseUtil.error(
          "Valid 10-digit phone number is required",
          400
        );
      }
      if (!dto.name || dto.name.trim().length < 2) {
        return ResponseUtil.error(
          "Name must be at least 2 characters long",
          400
        );
      }
      if (!dto.amount || dto.amount < 1) {
        return ResponseUtil.error("Amount must be greater than 0", 400);
      }
      if (!dto.period || dto.period < 1) {
        return ResponseUtil.error("Period must be at least 1 month", 400);
      }

      return this.razorpayService.createGuestSubscription(dto);
    } catch (error) {
      this.logger.error("Failed to create guest subscription:", error);
      return ResponseUtil.error("Failed to create guest subscription", 500);
    }
  }

  @Post("check-subscription-status")
  @ApiOperation({
    summary: "Check user subscription status",
    description:
      "Check subscription status for a phone number and get guidance on next steps. No authentication required.",
  })
  @ApiBody({
    description: "Phone number to check",
    schema: {
      type: "object",
      required: ["phone"],
      properties: {
        phone: {
          type: "string",
          example: "9876543210",
          pattern: "^[0-9]{10}$",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Subscription status retrieved successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        statusCode: { type: "number", example: 200 },
        message: { type: "string", example: "Subscription status retrieved" },
        data: {
          type: "object",
          properties: {
            userExists: { type: "boolean", example: true },
            userStatus: { type: "string", example: "active" },
            hasSubscription: { type: "boolean", example: true },
            subscriptionStatus: { type: "string", example: "active" },
            canLogin: { type: "boolean", example: true },
            canSubscribe: { type: "boolean", example: false },
            action: { type: "string", example: "login" },
            message: {
              type: "string",
              example: "Your account is active! You can login now.",
            },
          },
        },
      },
    },
  })
  async checkSubscriptionStatus(
    @Body() body: { phone: string }
  ): Promise<IResponse> {
    try {
      if (!body.phone || !/^\d{10}$/.test(body.phone)) {
        return ResponseUtil.error(
          "Valid 10-digit phone number is required",
          400
        );
      }

      return this.razorpayService.checkUserSubscriptionStatus(body.phone);
    } catch (error) {
      this.logger.error("Failed to check subscription status:", error);
      return ResponseUtil.error("Failed to check subscription status", 500);
    }
  }

  @Get("subscription/:id")
  @UseGuards(JwtAuthGuard)
  async getSubscription(
    @Param("id") subscriptionId: string
  ): Promise<IResponse> {
    return this.razorpayService.fetchSubscription(subscriptionId);
  }

  @Post("webhook")
  async handleWebhook(@Body() payload: any): Promise<IResponse> {
    this.logger.log(`Received webhook event: ${payload.event}`);
    this.logger.debug("Webhook payload:", payload);

    const {
      event,
      payload: webhookData,
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = payload;

    const isValid = this.razorpayService.verifyPaymentSignature({
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    });

    if (!isValid) {
      this.logger.error("Invalid webhook signature");
      return ResponseUtil.error("Invalid signature", 400);
    }

    try {
      switch (event) {
        case "subscription.activated":
          await this.razorpayService.handleSubscriptionActivated(webhookData);
          break;
        case "subscription.charged":
          await this.razorpayService.handleSubscriptionCharged(webhookData);
          break;
        case "subscription.cancelled":
          await this.razorpayService.handleSubscriptionCancelled(webhookData);
          break;
        case "subscription.pending":
          await this.razorpayService.handleSubscriptionPending(webhookData);
          break;
        default:
          this.logger.warn(`Unhandled webhook event: ${event}`);
      }

      return ResponseUtil.success(null, "Webhook processed successfully");
    } catch (error) {
      this.logger.error("Error processing webhook:", error);
      return ResponseUtil.error("Webhook processing failed", 500);
    }
  }

  @Post("subscription/:id/cancel")
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(
    @Param("id") subscriptionId: string,
    @Body("cancelAtCycleEnd") cancelAtCycleEnd: boolean
  ): Promise<IResponse> {
    return this.razorpayService.cancelSubscription(
      subscriptionId,
      cancelAtCycleEnd
    );
  }

  @Post("verify-payment")
  @UseGuards(JwtAuthGuard)
  async verifyPayment(
    @Body()
    payload: {
      razorpay_payment_id: string;
      razorpay_subscription_id: string;
      razorpay_signature: string;
    }
  ): Promise<IResponse> {
    this.logger.log("Verifying payment:", payload);

    const isValid = this.razorpayService.verifyPaymentSignature(payload);
    if (!isValid) {
      return ResponseUtil.error("Invalid payment signature", 400);
    }

    return ResponseUtil.success(null, "Payment verified successfully");
  }
}
