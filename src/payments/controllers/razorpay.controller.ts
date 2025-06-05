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
import { IResponse } from "../../types";
import { ResponseUtil } from "../../common/utils/response.util";

@Controller("payments/razorpay")
export class RazorpayController {
  private readonly logger = new Logger(RazorpayController.name);

  constructor(private readonly razorpayService: RazorpayService) {}

  @Post("subscription")
  @UseGuards(JwtAuthGuard)
  async createSubscription(
    @Request() req,
    @Body() dto: RazorpaySubscriptionDto
  ): Promise<IResponse> {
    try {
      const reporterId = req.user.reporter?.id;
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
