import { UseGuards } from '@nestjs/common';
import {
  OptionalJwtAuthGuard,
  OptionalSessionGuard,
} from '@/auth/guards/optional-auth.guard';

export const OptionalAuth = () =>
  UseGuards(OptionalJwtAuthGuard, OptionalSessionGuard);
