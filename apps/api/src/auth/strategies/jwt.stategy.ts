import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          if (!req) return null;
          const scope =
            req.headers?.['x-auth-scope'] ||
            req.params?.scope ||
            req.user?.scope ||
            'admin';
          return req.cookies?.[`${scope}_access_token`] || null;
        },
      ]),
      secretOrKey: process.env.JWT_ACCESS_SECRET || '',
    });
  }
  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
      scope: payload.scope,
      admin_level: payload.admin_level ?? 0,
      status: payload.status ?? 'ACTIVE',
    };
  }
}
