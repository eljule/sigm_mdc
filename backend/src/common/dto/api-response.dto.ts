export class ApiResponseDto<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;

  constructor(data: T, message?: string, success = true) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static ok<T>(data: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto<T>(data, message, true);
  }

  static fail<T>(message: string, data: T): ApiResponseDto<T> {
    return new ApiResponseDto<T>(data, message, false);
  }
}
