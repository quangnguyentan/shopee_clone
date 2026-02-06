import { User } from '@/user/entities/user.entity';
import { randomUUID } from 'crypto';
import * as jwt from 'jsonwebtoken';

export const generateAccessToken = (
  user: User,
  sessionId: string,
  scope: string,
) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId,
      scope,
      admin_level: user.admin_level ?? 0,
      status: user.status ?? 'ACTIVE',
    },
    process.env.JWT_ACCESS_SECRET!,
    {
      // expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN) ?? '15m',
      expiresIn: '15m',
    },
  );
export const generateRefreshToken = (
  user: User,
  sessionId: string,
  scope: string,
) => {
  const jti = randomUUID();
  return {
    token: jwt.sign(
      { sub: user.id, sessionId, jti, scope },
      process.env.JWT_REFRESH_SECRET!,
      {
        // expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN) ?? '7d',
        expiresIn: '7d',
      },
    ),
    jti,
  };
};

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
