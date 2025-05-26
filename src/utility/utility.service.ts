import { Injectable } from "@nestjs/common";
import { IResponse } from "src/types";

@Injectable()
export class UtilityService {
  generateResponse<T = unknown>(
    message: string,
    statusCode: number,
    success: boolean,
    data?: T
  ): IResponse<T> {
    return { message, statusCode, success, data };
  }
}
