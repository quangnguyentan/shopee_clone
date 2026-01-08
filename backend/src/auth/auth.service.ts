import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/user/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { SessionsService } from '@/session/session.service';
import { Session } from '@/session/entities/session.entity';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';
import { randomUUID } from 'crypto';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '@/middleware/jwt';
import { AppException } from '@/common/exceptions/app.exception';
import { AUTH_ERROR } from '@/common/errors/auth.error';
import { RegisterDto } from './dto/register.dto';
import { generateFromEmail } from 'unique-username-generator';
import { AVATAR_DEFAULT } from '@/common/constant/asset.constant';

const QR_EXPIRE_MS = 60 * 1000;
const qrSessions = new Map<
  string,
  { status: 'PENDING' | 'VERIFIED'; userId: string | null; createdAt: number }
>();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
  ) {}

  async getQRCode() {
    const sessionId = randomUUID();
    qrSessions.set(sessionId, {
      status: 'PENDING',
      userId: null,
      createdAt: Date.now(),
    });
    const qr = await QRCode.toDataURL(`login:${sessionId}`);
    return { qr, sessionId };
  }

  verifyQRCode(sessionId: string, userId: string) {
    const session = qrSessions.get(sessionId);
    if (!session || Date.now() - session.createdAt > QR_EXPIRE_MS) {
      qrSessions.delete(sessionId);
      throw new AppException(AUTH_ERROR.QR_EXPIRED);
    }
    session.status = 'VERIFIED';
    session.userId = userId;
    return { success: true };
  }

  checkQRStatus(sessionId: string) {
    const session = qrSessions.get(sessionId);
    if (!session || Date.now() - session.createdAt > QR_EXPIRE_MS) {
      qrSessions.delete(sessionId);
      return { status: 'EXPIRED' };
    }
    return session.status === 'VERIFIED'
      ? { status: 'VERIFIED', userId: session.userId }
      : { status: 'PENDING' };
  }

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new AppException(AUTH_ERROR.USER_ALREADY_EXISTS);

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      name: generateFromEmail(dto.email, {
        randomDigits: 2,
        stripLeadingDigits: true,
      }),
      password: hash,
      two_factor_enabled: false,
      avatar: AVATAR_DEFAULT,
    });
    await this.userRepo.save(user);
    return { message: 'Register success', userId: user.id };
  }

  async login(
    identifier: string,
    password: string,
    userAgent: string,
    ip: string,
    res: Response,
  ) {
    const user = await this.userRepo.findOne({ where: { email: identifier } });
    if (!user) throw new AppException(AUTH_ERROR.USER_NOT_FOUND);

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new AppException(AUTH_ERROR.INVALID_PASSWORD);

    if (user.two_factor_enabled) return { require2FA: true, userId: user.id };

    const deviceType = this.getDeviceType(userAgent);
    const session = await this.sessionsService.createSession({
      userId: user.id,
      ip,
      deviceType,
      userAgent,
    });
    return await this.issueTokens(user, session.id, res);
  }

  async refreshToken(oldToken: string, res: Response) {
    let payload: any;
    try {
      payload = verifyToken(oldToken);
    } catch {
      throw new AppException(AUTH_ERROR.INVALID_REFRESH_TOKEN);
    }
    const token = await this.refreshRepo.findOne({
      where: {
        jti: payload.jti,
        sessionId: payload.sessionId,
      },
    });
    if (!token) throw new AppException(AUTH_ERROR.INVALID_REFRESH_TOKEN);

    const isMatch = await bcrypt.compare(oldToken, token.token_hash);
    if (!isMatch) {
      throw new AppException(AUTH_ERROR.INVALID_REFRESH_TOKEN);
    }

    const session = await this.sessionsService.findById(payload.sessionId);
    if (!session || session.revoked) {
      console.log(!session || session.revoked);
      await this.refreshRepo.delete({ sessionId: payload.sessionId });
      res.clearCookie('accessToken', {
        secure: true,
        sameSite: 'none',
        path: '/',
      });

      res.clearCookie('refreshToken', {
        secure: true,
        sameSite: 'none',
        path: '/',
      });
      throw new AppException(AUTH_ERROR.SESSION_REVOKED);
    }

    const user = await this.userRepo.findOneBy({ id: session.userId });
    if (!user) throw new AppException(AUTH_ERROR.USER_NOT_FOUND);

    await this.refreshRepo.delete({ id: token.id });

    return this.issueTokens(user, session.id, res);
  }

  async logout(sessionId: string, res: Response) {
    await this.sessionsService.revokeSession(sessionId, { silent: true });
    res.clearCookie('accessToken', {
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    return { success: true };
  }

  async logoutAll(userId: number, res: Response) {
    await this.sessionsService.revokeAll(userId);
    res.clearCookie('accessToken', {
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    return { success: true };
  }

  private getDeviceType(userAgent: string): 'mobile' | 'desktop' {
    return /mobile|android|iphone|ipad/i.test(userAgent) ? 'mobile' : 'desktop';
  }
  private buildAuthResponse(user: User, sessionId: string) {
    return {
      authenticated: true,
      sessionId,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }

  private async issueTokens(user: User, sessionId: string, res: Response) {
    const accessToken = generateAccessToken(user, sessionId);
    const { token: refreshToken, jti } = generateRefreshToken(user, sessionId);
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await this.refreshRepo.manager.transaction(async (manager) => {
      await manager.delete(RefreshToken, { sessionId });
      const newToken = manager.create(RefreshToken, {
        sessionId,
        token_hash: tokenHash,
        revoked: false,
        jti,
      });
      await manager.save(newToken);
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return this.buildAuthResponse(user, sessionId);
  }

  async setup2FA(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new AppException(AUTH_ERROR.USER_NOT_FOUND);

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `(${user.email})`,
    });
    user.two_factor_secret = secret.base32;
    await this.userRepo.save(user);

    const qr = await QRCode.toDataURL(secret.otpauth_url);
    return { qr, secret: secret.base32 };
  }

  async verify2FA(userId: number, token: string, res: Response) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user || !user.two_factor_secret)
      throw new AppException(AUTH_ERROR.USER_NOT_FOUND);

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!verified) throw new AppException(AUTH_ERROR.INVALID_OTP);

    user.two_factor_enabled = true;
    await this.userRepo.save(user);

    const session = await this.sessionsService.createSession({
      userId: user.id,
      ip: '2FA',
      deviceType: 'desktop',
    });
    return this.issueTokens(user, session.id, res);
  }

  async requestChangePassword(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new AppException(AUTH_ERROR.USER_NOT_FOUND);

    if (user.two_factor_enabled)
      return { require2FA: true, action: 'CHANGE_PASSWORD' };

    const actionToken = this.jwtService.sign(
      { sub: user.id, action: 'CHANGE_PASSWORD' },
      { secret: process.env.JWT_ACTION_SECRET, expiresIn: '5m' },
    );
    return { require2FA: false, actionToken };
  }

  async verify2FAForAction(
    userId: number,
    action: 'CHANGE_PASSWORD',
    otp: string,
  ) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user || !user.two_factor_secret)
      throw new AppException(AUTH_ERROR.USER_NOT_FOUND);

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: otp,
      window: 1,
    });
    if (!verified) throw new AppException(AUTH_ERROR.INVALID_OTP);

    const actionToken = this.jwtService.sign(
      { sub: user.id, action },
      { secret: process.env.JWT_ACTION_SECRET, expiresIn: '5m' },
    );
    return { actionToken };
  }

  async changePassword(actionToken: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(actionToken, {
        secret: process.env.JWT_ACTION_SECRET,
      });
    } catch {
      throw new AppException(AUTH_ERROR.UNAUTHORIZED);
    }

    if (payload.action !== 'CHANGE_PASSWORD')
      throw new AppException(AUTH_ERROR.UNAUTHORIZED);

    const user = await this.userRepo.findOneBy({ id: payload.sub });
    if (!user) throw new AppException(AUTH_ERROR.USER_NOT_FOUND);

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);

    await this.refreshRepo.delete({
      session: { userId: user.id },
      revoked: false,
    });

    return { message: 'Password changed successfully' };
  }
}
