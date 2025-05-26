export interface IResponse<T = unknown> {
  message: string;
  statusCode: number;
  success: boolean;
  data?: T;
}
