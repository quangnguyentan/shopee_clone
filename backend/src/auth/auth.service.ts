import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as QRCode from 'qrcode';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { AppException } from '@/common/exceptions/app.exception';
import { AUTH_ERROR } from '@/common/errors/auth.error';
const qrSessions = new Map<
  string,
  {
    status: 'PENDING' | 'VERIFIED';
    userId: string | null;
    createdAt: number;
  }
>();

const QR_EXPIRE_MS = 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async getQRCode() {
    const sessionId = randomUUID();

    qrSessions.set(sessionId, {
      status: 'PENDING',
      userId: null,
      createdAt: Date.now(),
    });

    const qrPayload = `login:${sessionId}`;
    const qr = await QRCode.toDataURL(qrPayload);

    return { qr, sessionId };
  }

  verifyQRCode(sessionId: string, userId: string) {
    const session = qrSessions.get(sessionId);

    if (!session) {
      throw new AppException(AUTH_ERROR.QR_EXPIRED);
    }

    if (Date.now() - session.createdAt > QR_EXPIRE_MS) {
      qrSessions.delete(sessionId);
      throw new AppException(AUTH_ERROR.QR_EXPIRED);
    }

    session.status = 'VERIFIED';
    session.userId = userId;

    return { success: true };
  }

  checkQRStatus(sessionId: string) {
    const session = qrSessions.get(sessionId);

    if (!session) {
      return { status: 'EXPIRED' };
    }
    console.log(Date.now() - session.createdAt, 'createdAt');
    console.log(QR_EXPIRE_MS, 'qr');
    if (Date.now() - session.createdAt > QR_EXPIRE_MS) {
      qrSessions.delete(sessionId);
      return { status: 'EXPIRED' };
    }

    if (session.status === 'VERIFIED') {
      return {
        status: 'VERIFIED',
        userId: session.userId,
      };
    }

    return { status: 'PENDING' };
  }

  async validatePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (exists) {
      throw new AppException(AUTH_ERROR.USER_NOT_FOUND);
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      email: dto.email,
      name: dto.name,
      password: hash,
      two_factor_enabled: false,
    });

    await this.userRepo.save(user);

    return {
      message: 'Register success',
      userId: user.id,
    };
  }
  async refreshToken(refreshToken: string, res: Response) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET_KEY,
      });
      const user = await this.userRepo.findOneBy({ id: payload.sub });
      if (!user) throw new AppException(AUTH_ERROR.USER_NOT_FOUND);
      return this.issueTokens(user, res);
    } catch {
      throw new AppException(AUTH_ERROR.INVALID_REFRESH_TOKEN);
    }
  }
  logout(res: Response) {
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
    return { message: 'Logged out' };
  }

  async login(identifier: string, password: string, res: Response) {
    const user = await this.userRepo.findOne({
      where: { email: identifier },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const ok = await this.validatePassword(password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid password');
    }

    if (user.two_factor_enabled) {
      return {
        require2FA: true,
        userId: user.id,
      };
    }

    return this.issueTokens(user, res);
  }

  issueTokens(user: User, res: Response) {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  async setup2FA(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException();

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `(${user.email})`,
    });

    user.two_factor_secret = secret.base32;
    await this.userRepo.save(user);

    const qr = await QRCode.toDataURL(secret.otpauth_url);

    return {
      qr,
      secret: secret.base32,
    };
  }

  async verify2FA(userId: number, token: string, res: Response) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user || !user.two_factor_secret) {
      throw new UnauthorizedException();
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid OTP');
    }

    user.two_factor_enabled = true;
    await this.userRepo.save(user);

    return this.issueTokens(user, res);
  }
  async requestChangePassword(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException();

    if (user.two_factor_enabled) {
      return {
        require2FA: true,
        action: 'CHANGE_PASSWORD',
      };
    }

    // (không khuyến nghị, nhưng cho đủ case)
    const actionToken = this.jwtService.sign(
      { sub: user.id, action: 'CHANGE_PASSWORD' },
      { expiresIn: '5m' },
    );

    return {
      require2FA: false,
      actionToken,
    };
  }
  async verify2FAForAction(
    userId: number,
    action: 'CHANGE_PASSWORD',
    otp: string,
  ) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user || !user.two_factor_secret) {
      throw new UnauthorizedException();
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: otp,
      window: 1,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const actionToken = this.jwtService.sign(
      {
        sub: user.id,
        action,
      },
      { expiresIn: '5m' },
    );

    return { actionToken };
  }
  async changePassword(actionToken: string, newPassword: string) {
    let payload: any;

    try {
      payload = this.jwtService.verify(actionToken, {
        secret: process.env.JWT_SECRET_KEY,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired action token');
    }

    if (payload.action !== 'CHANGE_PASSWORD') {
      throw new UnauthorizedException('Invalid action');
    }

    const user = await this.userRepo.findOneBy({ id: payload.sub });
    if (!user) throw new UnauthorizedException();

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);

    return { message: 'Password changed successfully' };
  }
}
