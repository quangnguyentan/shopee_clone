import { User } from '@/user/entities/user.entity';
import { randomUUID } from 'crypto';
import * as jwt from 'jsonwebtoken';

export const generateAccessToken = (user: User, sessionId: string) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    },
    process.env.JWT_ACCESS_SECRET!,
    {
      // expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN) ?? '15m',
      expiresIn: '15m',
    },
  );
export const generateRefreshToken = (user: User, sessionId: string) => {
  const jti = randomUUID();
  return {
    token: jwt.sign(
      { sub: user.id, sessionId, jti },
      process.env.JWT_REFRESH_SECRET!,
      {
        // expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN) ?? '7d',
        expiresIn: '7d',
      },
    ),
    jti,
  };
};

export const verifyToken = (oldToken: string) =>
  jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET!);
