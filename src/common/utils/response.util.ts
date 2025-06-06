import { IResponse } from "../../types/index";

export class ResponseUtil {
  static success<T>(
    data: T,
    message: string = "Operation successful",
    statusCode: number = 200
  ): IResponse<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  }

  static error<T = any>(
    message: string = "Operation failed",
    statusCode: number = 500,
    data: T = {} as T
  ): IResponse<T> {
    return {
      success: false,
      statusCode,
      message,
      data,
    };
  }
}
