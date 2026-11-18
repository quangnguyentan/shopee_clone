import { AUTH_ERROR_STATUS } from './auth.error';
import { USER_ERROR_STATUS } from './user.error';

export const ERROR_STATUS_MAP = {
  ...AUTH_ERROR_STATUS,
  ...USER_ERROR_STATUS,
};
