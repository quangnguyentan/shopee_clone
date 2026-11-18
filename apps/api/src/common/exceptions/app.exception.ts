import { HttpException } from '@nestjs/common';
import { AUTH_ERROR_STATUS } from '../errors/auth.error';
import { ERROR_STATUS_MAP } from '../errors';

export class AppException extends HttpException {
  constructor(code: string, message?: string) {
    super(
      {
        code,
        message,
      },
      ERROR_STATUS_MAP[code] ?? 500,
    );
  }
}
