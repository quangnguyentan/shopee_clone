// auth/decorators/auth-role.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { SessionGuard } from '@/session/guards/session.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles, Role } from './roles.decorator';

export const AuthRole = (...roles: Role[]) =>
  applyDecorators(
    Roles(...roles),
    UseGuards(JwtAuthGuard, SessionGuard, RolesGuard),
  );
