import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IResponse } from "../../types/index";
import { ResponseUtil } from "../../common/utils/response.util";
import { RazorpaySubscriptionDto } from "../dto/razorpay-subscription.dto";
import { PrismaService } from "../../prisma/prisma.service";
import { PaymentStatus, SubscriptionStatus, UserStatus } from "@prisma/client";

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

  async createGuestSubscription(dto: {
    phone: string;
    name: string;
    amount: number;
    period: number;
  }): Promise<IResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findFirst({
        where: { phone: dto.phone },
      });

      let user: any;
      if (existingUser) {
        user = existingUser;
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            name: dto.name,
            phone: dto.phone,
            status: UserStatus.inactive, // Will be activated after payment
            role: "reporter",
          },
        });
      }

      // Create or get reporter profile
      let reporter = await this.prisma.reporter.findFirst({
        where: { userId: user.id },
      });

      if (!reporter) {
        // For guest subscriptions, create minimal reporter profile with default locations
        reporter = await this.prisma.reporter.create({
          data: {
            userId: user.id,
            level: "REPORTER", // Default level
            countryId: 1, // Default to India (seeded)
            stateId: 1, // Default to state (seeded)
            subscribed: false,
            // Optional location fields will be filled later when user completes profile
          },
        });
      }

      // Create a plan for this guest subscription
      const plan = await this.createPlan({
        ...dto,
        reporterId: user.id,
      });

      // Create subscription with the plan
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: plan.id,
        total_count: 12,
        customer_notify: 1,
        notes: {
          created_at: new Date().toISOString(),
          guest_subscription: true,
          user_id: user.id,
          reporter_id: reporter.id,
        },
      });

      // Save subscription to database
      await this.prisma.subscription.create({
        data: {
          reporterId: reporter.id,
          planName: `Plan-${plan.id}`,
          amount: dto.amount / 100, // Convert paise to rupees
          status: SubscriptionStatus.active, // Start as active, will be updated by webhook
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      });

      return ResponseUtil.success(
        {
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            status: user.status,
          },
          subscription: {
            id: subscription.id,
            status: subscription.status,
            plan_id: subscription.plan_id,
          },
          paymentUrl: subscription.short_url,
        },
        "Guest subscription created successfully",
        201
      );
    } catch (error) {
      this.logger.error("Failed to create guest subscription", error.stack);
      return ResponseUtil.error("Failed to create guest subscription", 500);
    }
  }

  async checkUserSubscriptionStatus(phone: string): Promise<IResponse> {
    try {
      // Find user by phone
      const user = await this.prisma.user.findFirst({
        where: { phone },
        include: {
          reporter: {
            include: {
              subscriptions: true,
            },
          },
        },
      });

      if (!user) {
        // User doesn't exist - they can create a guest subscription
        return ResponseUtil.success(
          {
            userExists: false,
            canSubscribe: true,
            action: "create_guest_subscription",
            message: "Create your account and subscribe to get started",
            subscriptionUrl: "/payments/razorpay/guest-subscription",
          },
          "User not found - can create new subscription"
        );
      }

      if (!user.reporter) {
        // User exists but no reporter profile - they can create a guest subscription
        return ResponseUtil.success(
          {
            userExists: true,
            userStatus: user.status,
            hasReporter: false,
            canSubscribe: true,
            action: "create_guest_subscription",
            message: "Complete your subscription to activate your account",
            subscriptionUrl: "/payments/razorpay/guest-subscription",
          },
          "User exists but no subscription found"
        );
      }

      const subscription = user.reporter.subscriptions?.[0]; // Get latest subscription

      if (!subscription) {
        // User and reporter exist but no subscription
        return ResponseUtil.success(
          {
            userExists: true,
            userStatus: user.status,
            hasReporter: true,
            hasSubscription: false,
            canSubscribe: true,
            action: "create_guest_subscription",
            message:
              "Subscribe to activate your account and access all features",
            subscriptionUrl: "/payments/razorpay/guest-subscription",
          },
          "No active subscription found"
        );
      }

      // User has subscription - check status
      const isActive = subscription.status === SubscriptionStatus.active;
      const isExpired = subscription.status === SubscriptionStatus.expired;

      if (user.status === UserStatus.inactive && isActive) {
        // Subscription is active but user account is inactive - this shouldn't happen
        // Activate the user account
        await this.prisma.user.update({
          where: { id: user.id },
          data: { status: UserStatus.active },
        });

        return ResponseUtil.success(
          {
            userExists: true,
            userStatus: UserStatus.active,
            hasReporter: true,
            hasSubscription: true,
            subscriptionStatus: subscription.status,
            canLogin: true,
            action: "login",
            message: "Your account has been activated! You can now login.",
            loginUrl: "/api/auth/login",
          },
          "Account activated - you can now login"
        );
      }

      if (user.status === UserStatus.active && isActive) {
        // Everything is good - user can login
        return ResponseUtil.success(
          {
            userExists: true,
            userStatus: user.status,
            hasReporter: true,
            hasSubscription: true,
            subscriptionStatus: subscription.status,
            canLogin: true,
            action: "login",
            message: "Your account is active! You can login now.",
            loginUrl: "/api/auth/login",
          },
          "Account is active and ready to use"
        );
      }

      if (isExpired) {
        // Subscription expired - user needs to renew
        return ResponseUtil.success(
          {
            userExists: true,
            userStatus: user.status,
            hasReporter: true,
            hasSubscription: true,
            subscriptionStatus: subscription.status,
            canSubscribe: true,
            action: "renew_subscription",
            message:
              "Your subscription has expired. Renew to continue using all features.",
            subscriptionUrl: "/payments/razorpay/guest-subscription",
          },
          "Subscription expired - renewal required"
        );
      }

      // Default case - something is wrong, allow guest subscription
      return ResponseUtil.success(
        {
          userExists: true,
          userStatus: user.status,
          hasReporter: !!user.reporter,
          hasSubscription: !!subscription,
          subscriptionStatus: subscription?.status,
          canSubscribe: true,
          action: "create_guest_subscription",
          message:
            "There seems to be an issue with your account. Create a new subscription to resolve it.",
          subscriptionUrl: "/payments/razorpay/guest-subscription",
        },
        "Account status unclear - can create new subscription"
      );
    } catch (error) {
      this.logger.error(
        "Failed to check user subscription status",
        error.stack
      );
      return ResponseUtil.error("Failed to check subscription status", 500);
    }
  }
}
