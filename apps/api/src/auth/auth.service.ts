import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThan, Repository } from 'typeorm';
import { User } from '@/user/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { SessionsService } from '@/session/session.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';
import { randomUUID } from 'crypto';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/middleware/jwt';
import { AppException } from '@/common/exceptions/app.exception';
import { AUTH_ERROR } from '@/common/errors/auth.error';
import { RegisterDto } from './dto/register.dto';
import { generateFromEmail } from 'unique-username-generator';
import { AVATAR_DEFAULT } from '@/common/constant/asset.constant';
import { Cron } from '@nestjs/schedule';
import * as nodemailer from 'nodemailer';
import { generateOTP } from '@/common/utils/generateOTP';
import { CreateAdminDto } from './dto/create-admin.dto';

const QR_EXPIRE_MS = 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const qrSessions = new Map<
  string,
  { status: 'PENDING' | 'VERIFIED'; userId: string | null; createdAt: number }
>();

export type AuthScope = 'admin' | 'buyer' | 'seller';

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

  private async sendVerifyOtpEmail(email: string, otp: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Shopee Clone" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `
      <h3>Your verification code</h3>
      <h1 style="letter-spacing:4px">${otp}</h1>
      <p>This code will expire in 10 minutes</p>
    `,
    });
  }

  async resendVerifyEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new AppException(AUTH_ERROR.USER_NOT_FOUND);

    const now = Date.now();
    if (
      user.last_verify_email_sent_at &&
      now - user.last_verify_email_sent_at.getTime() < RESEND_COOLDOWN_MS
    ) {
      return {
        cooldown: Math.ceil(
          (RESEND_COOLDOWN_MS -
            (now - user.last_verify_email_sent_at.getTime())) /
            1000,
        ),
      };
    }

    const otp = generateOTP();
    user.email_verify_otp = await bcrypt.hash(otp, 10);
    user.email_verify_otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
    user.last_verify_email_sent_at = new Date();

    await this.userRepo.save(user);
    await this.sendVerifyOtpEmail(email, otp);

    return { success: true, cooldown: 60 };
  }

  async verifyEmailOtp(email: string, otp: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new AppException(AUTH_ERROR.USER_NOT_FOUND);

    if (user.email_verified)
      throw new AppException(AUTH_ERROR.EMAIL_ALREADY_VERIFIED);

    if (
      !user.email_verify_otp ||
      !user.email_verify_otp_expires_at ||
      user.email_verify_otp_expires_at < new Date()
    ) {
      throw new AppException(AUTH_ERROR.OTP_EXPIRED);
    }

    const isValid = await bcrypt.compare(otp, user.email_verify_otp);
    if (!isValid) throw new AppException(AUTH_ERROR.INVALID_OTP);

    user.email_verified = true;
    user.email_verify_otp = null;
    user.email_verify_otp_expires_at = null;

    await this.userRepo.save(user);

    return { message: 'Email verified successfully' };
  }

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new AppException(AUTH_ERROR.USER_ALREADY_EXISTS);

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);

    const user = this.userRepo.create({
      email: dto.email,
      phone: dto.phone,
      password: await bcrypt.hash(dto.password, 10),
      name: generateFromEmail(dto.email),
      avatar: AVATAR_DEFAULT,
      auth_provider: 'local',
      email_verified: false,
      email_verify_otp: otpHash,
      email_verify_otp_expires_at: new Date(Date.now() + 10 * 60 * 1000),
      last_verify_email_sent_at: new Date(),
    });

    await this.userRepo.save(user);
    await this.sendVerifyOtpEmail(dto.email, otp);

    return {
      message: 'OTP sent to email',
      email: dto.email,
    };
  }

  async socialLogin(
    profile: {
      provider: 'google' | 'facebook';
      providerId: string;
      email: string;
      name: string;
      avatar: string;
    },
    userAgent: string,
    ip: string,
    res: Response,
    scope: AuthScope,
  ) {
    if (scope === 'admin') {
      throw new AppException(AUTH_ERROR.SOCIAL_LOGIN_NOT_ALLOWED);
    }

    let user = await this.userRepo.findOne({
      where: {
        auth_provider: profile.provider,
        social_id: profile.providerId,
      },
    });

    if (!user && profile.email) {
      const emailUser = await this.userRepo.findOne({
        where: { email: profile.email },
      });

      if (emailUser) {
        emailUser.auth_provider = profile.provider;
        emailUser.social_id = profile.providerId;
        emailUser.email_verified = true;

        if (!emailUser.role) {
          emailUser.role = scope;
        }

        user = await this.userRepo.save(emailUser);
      }
    }
    if (!user) {
      user = this.userRepo.create({
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar,
        auth_provider: profile.provider,
        social_id: profile.providerId,
        email_verified: true,
        role: scope,
      });
      await this.userRepo.save(user);
    }

    const session = await this.sessionsService.createSession({
      userId: user.id,
      ip,
      deviceType: this.getDeviceType(userAgent),
      userAgent,
    });

    return this.issueTokens(
      this.refreshRepo.manager,
      user,
      session.id,
      res,
      scope,
    );
  }

  async login(
    identifier: string,
    password: string,
    userAgent: string,
    ip: string,
    res: Response,
    scope: AuthScope,
  ) {
    const user = await this.userRepo.findOne({ where: { email: identifier } });
    if (!user) throw new AppException(AUTH_ERROR.USER_NOT_FOUND);
    if (user.role !== scope) {
      throw new AppException(AUTH_ERROR.UNAUTHORIZED);
    }
    if (user.auth_provider === 'local' && !user.email_verified) {
      throw new AppException(AUTH_ERROR.EMAIL_NOT_VERIFIED, identifier);
    }
    if (scope === 'admin' && user.admin_level !== 2) {
      if (user.status !== 'ACTIVE') {
        throw new AppException(AUTH_ERROR.ADMIN_NOT_APPROVED);
      }

      if (!user.two_factor_enabled) {
        return { require2FASetup: true };
      }
    }
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
    return await this.issueTokens(
      this.refreshRepo.manager,
      user,
      session.id,
      res,
      scope,
    );
  }
  async refreshToken(refreshToken: string, res: Response, scope: AuthScope) {
    if (!refreshToken) {
      this.clearAuthCookies(res, scope);
      throw new AppException(AUTH_ERROR.INVALID_REFRESH_TOKEN);
    }
    let payload: any;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      this.clearAuthCookies(res, scope);
      throw new AppException(AUTH_ERROR.INVALID_REFRESH_TOKEN);
    }
    if (payload.scope !== scope) {
      this.clearAuthCookies(res, scope);
      throw new AppException(AUTH_ERROR.SCOPE_MISMATCH);
    }
    const oldToken = await this.refreshRepo.findOne({
      where: {
        jti: payload.jti,
        sessionId: payload.sessionId,
        revoked: false,
      },
    });
    if (!oldToken) {
      this.clearAuthCookies(res, scope);
      throw new AppException(AUTH_ERROR.INVALID_REFRESH_TOKEN);
    }
    const isMatch = await bcrypt.compare(refreshToken, oldToken.token_hash);
    if (!isMatch) {
      this.clearAuthCookies(res, scope);
      throw new AppException(AUTH_ERROR.INVALID_REFRESH_TOKEN);
    }

    const session = await this.sessionsService.findById(payload.sessionId);
    if (!session || session.revoked) {
      this.clearAuthCookies(res, scope);
      throw new AppException(AUTH_ERROR.SESSION_REVOKED);
    }

    const user = await this.userRepo.findOneBy({ id: session.userId });
    if (!user) throw new AppException(AUTH_ERROR.USER_NOT_FOUND);
    return this.refreshRepo.manager.transaction(async (manager) => {
      const result = await this.issueTokens(
        manager,
        user,
        session.id,
        res,
        payload.scope,
      );

      await manager.update(
        RefreshToken,
        { id: oldToken.id },
        { revoked: true },
      );

      return result;
    });
  }
  @Cron('0 3 * * *')
  async cleanupRevokedTokens() {
    await this.refreshRepo.delete({
      revoked: true,
      created_at: LessThan(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    });
  }
  private clearAuthCookies(res: Response, scope: AuthScope) {
    const { access, refresh } = this.getAuthCookieNames(scope);
    res.clearCookie(access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.clearCookie(refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
  }

  private clearAllAuthCookies(res: Response) {
    (['admin', 'buyer', 'seller'] as AuthScope[]).forEach((scope) =>
      this.clearAuthCookies(res, scope),
    );
  }
  async logoutByRefresh(refreshToken: string, res: Response) {
    if (!refreshToken) {
      this.clearAllAuthCookies(res);
      return { success: true };
    }

    let payload: any;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      this.clearAllAuthCookies(res);
      return { success: true };
    }

    await this.sessionsService.revokeSession(payload.sessionId, {
      silent: true,
    });
    await this.refreshRepo.delete({ sessionId: payload.sessionId });

    this.clearAuthCookies(res, payload.scope);
    return { success: true };
  }

  async logoutAllByRefresh(refreshToken: string, res: Response) {
    if (!refreshToken) {
      this.clearAllAuthCookies(res);
      return { success: true };
    }

    let payload: any;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      this.clearAllAuthCookies(res);
      return { success: true };
    }

    const session = await this.sessionsService.findById(payload.sessionId);
    if (!session) {
      this.clearAllAuthCookies(res);
      return { success: true };
    }

    await this.sessionsService.revokeAll(session.userId);

    await this.refreshRepo.delete({
      session: { userId: session.userId },
    });

    this.clearAllAuthCookies(res);
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
  getAuthCookieNames(scope: AuthScope) {
    return {
      access: `${scope}_access_token`,
      refresh: `${scope}_refresh_token`,
    };
  }

  private async issueTokens(
    manager: EntityManager,
    user: User,
    sessionId: string,
    res: Response,
    scope: AuthScope,
  ) {
    const { access, refresh } = this.getAuthCookieNames(scope);
    const accessToken = generateAccessToken(user, sessionId, scope);
    const { token: refreshToken, jti } = generateRefreshToken(
      user,
      sessionId,
      scope,
    );
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const newToken = manager.create(RefreshToken, {
      sessionId,
      token_hash: tokenHash,
      revoked: false,
      jti,
    });

    await manager.save(newToken);

    res.cookie(access, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie(refresh, refreshToken, {
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

  async verify2FA(
    userId: number,
    token: string,
    res: Response,
    scope: AuthScope,
  ) {
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
    return this.issueTokens(
      this.refreshRepo.manager,
      user,
      session.id,
      res,
      scope,
    );
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
  async createAdmin(dto: CreateAdminDto, creator: User) {
    if (creator.admin_level !== 2) {
      throw new AppException(AUTH_ERROR.UNAUTHORIZED);
    }

    const exists = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) throw new AppException(AUTH_ERROR.USER_ALREADY_EXISTS);

    const admin = this.userRepo.create({
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      role: 'admin',
      admin_level: 1,
      status: 'PENDING',
      email_verified: true,
    });

    await this.userRepo.save(admin);

    return {
      message: 'Admin created. Waiting for approval.',
    };
  }

  async approveAdmin(adminId: number, approver: User) {
    if (approver.admin_level !== 2) {
      throw new AppException(AUTH_ERROR.UNAUTHORIZED);
    }

    const admin = await this.userRepo.findOneBy({ id: adminId });
    if (!admin || admin.role !== 'admin') {
      throw new AppException(AUTH_ERROR.USER_NOT_FOUND);
    }

    admin.status = 'ACTIVE';
    await this.userRepo.save(admin);

    return { message: 'Admin approved' };
  }

  async suspendAdmin(adminId: number, approver: User) {
    if (approver.admin_level !== 2) {
      throw new AppException(AUTH_ERROR.UNAUTHORIZED);
    }

    const admin = await this.userRepo.findOneBy({ id: adminId });
    if (!admin) throw new AppException(AUTH_ERROR.USER_NOT_FOUND);

    admin.status = 'SUSPENDED';
    await this.userRepo.save(admin);

    // revoke toàn bộ session
    await this.sessionsService.revokeAll(admin.id);

    return { message: 'Admin suspended' };
  }
}
