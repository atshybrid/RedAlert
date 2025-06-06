import { Injectable } from "@nestjs/common";
import { IResponse } from "../types/index";
import { ResponseUtil } from "../common/utils/response.util";

@Injectable()
export class UtilityService {
  generateResponse<T = any>(
    message: string,
    statusCode: number,
    success: boolean,
    data?: T
  ): IResponse<T> {
    return success
      ? ResponseUtil.success(data, message, statusCode)
      : ResponseUtil.error(message, statusCode, data);
  }
}
