import { HttpStatus } from '@nestjs/common';

export const USER_ERROR = {
  USER_NOT_FOUND: 'USER.USER_NOT_FOUND',
  UNAUTHORIZED: 'USER.UNAUTHORIZED',
} as const;

export type UserErrorCode = (typeof USER_ERROR)[keyof typeof USER_ERROR];

export const USER_ERROR_STATUS: Record<UserErrorCode, HttpStatus> = {
  [USER_ERROR.USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [USER_ERROR.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
};
