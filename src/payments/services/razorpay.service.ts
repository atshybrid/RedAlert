import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IResponse } from "../../types";
import { ResponseUtil } from "../../common/utils/response.util";
import { RazorpaySubscriptionDto } from "../dto/razorpay-subscription.dto";
import { PrismaService } from "../../prisma/prisma.service";
import { PaymentStatus, SubscriptionStatus } from "@prisma/client";

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private readonly razorpay: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    const Razorpay = require("razorpay");
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>("RAZORPAY_KEY_ID"),
      key_secret: this.configService.get<string>("RAZORPAY_KEY_SECRET"),
    });
  }

  async createPlan(dto: RazorpaySubscriptionDto): Promise<any> {
    try {
      const plan = await this.razorpay.plans.create({
        period: "monthly",
        interval: dto.period,
        item: {
          name: "Reporter Subscription Plan",
          amount: dto.amount,
          currency: "INR",
          description: "Monthly subscription for reporters",
        },
        notes: {
          ...(dto.notes && { notes: dto.notes }),
          reporterId: dto.reporterId,
        },
      });
      return plan;
    } catch (error) {
      this.logger.error("Failed to create Razorpay plan:", error);
      throw error;
    }
  }

  async createSubscription(planId: string): Promise<IResponse> {
    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: planId,
        total_count: 12,
        customer_notify: 1,
        notes: {
          created_at: new Date().toISOString(),
        },
      });

      return ResponseUtil.success(
        subscription,
        "Subscription created successfully",
        201
      );
    } catch (error) {
      this.logger.error("Failed to create Razorpay subscription:", error);
      return ResponseUtil.error(
        "Failed to create subscription",
        error.statusCode || 500
      );
    }
  }

  async fetchSubscription(subscriptionId: string): Promise<IResponse> {
    try {
      const subscription = await this.razorpay.subscriptions.fetch(
        subscriptionId
      );
      return ResponseUtil.success(subscription, "Subscription details fetched");
    } catch (error) {
      this.logger.error("Failed to fetch subscription:", error);
      return ResponseUtil.error(
        "Failed to fetch subscription details",
        error.statusCode || 500
      );
    }
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtCycleEnd: boolean = true
  ): Promise<IResponse> {
    try {
      const subscription = await this.razorpay.subscriptions.cancel(
        subscriptionId,
        cancelAtCycleEnd
      );
      return ResponseUtil.success(
        subscription,
        "Subscription cancelled successfully"
      );
    } catch (error) {
      this.logger.error("Failed to cancel subscription:", error);
      return ResponseUtil.error(
        "Failed to cancel subscription",
        error.statusCode || 500
      );
    }
  }

  verifyPaymentSignature(params: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }): boolean {
    try {
      const secret = this.configService.get<string>("RAZORPAY_WEBHOOK_SECRET");
      const crypto = require("crypto");

      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(
        params.razorpay_payment_id + "|" + params.razorpay_subscription_id
      );
      const generatedSignature = hmac.digest("hex");

      return params.razorpay_signature === generatedSignature;
    } catch (error) {
      this.logger.error("Signature verification failed:", error);
      return false;
    }
  }

  async handleSubscriptionActivated(webhookData: any) {
    const { subscription_id, reporter_id } = webhookData;

    await this.prisma.subscription.update({
      where: { id: subscription_id },
      data: {
        status: SubscriptionStatus.active,
      },
    });

    await this.prisma.reporter.update({
      where: { id: reporter_id },
      data: {
        subscribed: true,
      },
    });

    this.logger.log(
      `Subscription ${subscription_id} activated for reporter ${reporter_id}`
    );
  }

  async handleSubscriptionCharged(webhookData: any) {
    const { subscription_id, payment_id, amount } = webhookData;

    await this.prisma.payment.create({
      data: {
        reporterId: webhookData.reporter_id,
        amount: amount / 100,
        status: PaymentStatus.paid,
        paidOn: new Date(),
        paymentMethod: "razorpay",
        paymentReference: payment_id,
      },
    });

    this.logger.log(`Payment recorded for subscription ${subscription_id}`);
  }

  async handleSubscriptionCancelled(webhookData: any) {
    const { subscription_id, reporter_id } = webhookData;

    await this.prisma.subscription.update({
      where: { id: subscription_id },
      data: {
        status: SubscriptionStatus.expired,
        endDate: new Date(),
      },
    });

    await this.prisma.reporter.update({
      where: { id: reporter_id },
      data: {
        subscribed: false,
      },
    });

    this.logger.log(
      `Subscription ${subscription_id} expired for reporter ${reporter_id}`
    );
  }

  async handleSubscriptionPending(webhookData: any) {
    const { subscription_id } = webhookData;
    this.logger.log(
      `Received pending status for subscription ${subscription_id} - no status change needed`
    );
  }
}
