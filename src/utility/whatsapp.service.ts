import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { IResponse } from "../types";
import { ResponseUtil } from "../common/utils/response.util";

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly fromNumber: string;
  private readonly templateId: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = configService.get<string>("WHATSAPP_API_KEY");
    this.apiUrl = configService.get<string>("WHATSAPP_URL");
    this.fromNumber = configService.get<string>("WHATSAPP_FROM");
    this.templateId = configService.get<string>("WHATSAPP_TEMPLATE_ID");
  }

  async sendOtp(phone: string, otp: string): Promise<IResponse<boolean>> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          from: this.fromNumber,
          to: phone,
          type: "template",
          message: {
            templateid: this.templateId,
            placeholders: [otp],
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: this.apiKey,
          },
        }
      );

      const success = response.status === 200;
      if (success) {
        return ResponseUtil.success(true, "OTP sent successfully");
      } else {
        return ResponseUtil.error("Failed to send OTP", 400);
      }
    } catch (error) {
      this.logger.error(
        "WhatsApp OTP sending failed:",
        error.response?.data || error.message
      );
      return ResponseUtil.error("Failed to send OTP via WhatsApp", 500);
    }
  }
}
