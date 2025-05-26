export interface IResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

// Legacy interface - kept for backward compatibility
export interface ILegacyResponse<T = unknown> {
  message: string;
  statusCode: number;
  success: boolean;
  data?: T;
}
