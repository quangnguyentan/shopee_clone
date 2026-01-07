import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { SessionGuard } from '@/session/guards/session.guard';
import { UseGuards } from '@nestjs/common';

export const Auth = () => UseGuards(JwtAuthGuard, SessionGuard);
