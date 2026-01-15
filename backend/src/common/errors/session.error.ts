import { HttpStatus } from '@nestjs/common';

export const USER_ERROR = {
  USER_NOT_FOUND: 'AUTH.USER_NOT_FOUND',
  UNAUTHORIZED: 'AUTH.UNAUTHORIZED',
} as const;

export type AuthErrorCode = (typeof USER_ERROR)[keyof typeof USER_ERROR];

export const USER_ERROR_STATUS: Record<AuthErrorCode, HttpStatus> = {
  [USER_ERROR.USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [USER_ERROR.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
};
