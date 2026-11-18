import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  Req,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { type AuthScope, AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';
import { Setup2FADto } from './dto/setup-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { Verify2FAActionDto } from './dto/verify-2fa-action.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { AuthGuard } from '@nestjs/passport';
import { SuperAdminGuard } from './guards/supper-admin.guard';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('qr')
  getQRCode() {
    return this.authService.getQRCode();
  }

  @UseGuards(JwtAuthGuard)
  @Post('qr/verify')
  verifyQRCode(@Req() req, @Body() body: { sessionId: string }) {
    return this.authService.verifyQRCode(body.sessionId, req.user.sub);
  }

  @Get('qr/status/:sessionId')
  checkQRStatus(@Param('sessionId') sessionId: string) {
    return this.authService.checkQRStatus(sessionId);
  }

  @Post('resend-verify-email')
  resendVerifyEmail(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email is required');
    return this.authService.resendVerifyEmail(email);
  }

  @Post('verify-email-otp')
  verifyEmailOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyEmailOtp(body.email, body.otp);
  }

  @Post('register') register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @Post(':scope/login')
  login(
    @Param('scope') scope: AuthScope,
    @Body() dto: LoginDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    if (!['admin', 'buyer', 'seller'].includes(scope)) {
      throw new BadRequestException('Invalid auth scope');
    }
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
    return this.authService.login(
      dto.identifier,
      dto.password,
      req.headers['user-agent'],
      ip,
      res,
      scope,
    );
  }
  @Post(':scope/refresh')
  refresh(
    @Param('scope') scope: AuthScope,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const headerScope = req.headers['x-auth-scope'];

    if (headerScope && headerScope !== scope) {
      throw new BadRequestException('Scope mismatch');
    }

    const refreshToken = req.cookies?.[`${scope}_refresh_token`];
    return this.authService.refreshToken(refreshToken, res, scope);
  }

  @Post('logout')
  logout(@Req() req, @Res({ passthrough: true }) res: any) {
    const refreshToken =
      req.cookies?.admin_refresh_token ||
      req.cookies?.buyer_refresh_token ||
      req.cookies?.seller_refresh_token;

    return this.authService.logoutByRefresh(refreshToken, res);
  }
  @Post('logout-all')
  logoutAll(@Req() req, @Res({ passthrough: true }) res: any) {
    const refreshToken =
      req.cookies?.admin_refresh_token ||
      req.cookies?.buyer_refresh_token ||
      req.cookies?.seller_refresh_token;

    return this.authService.logoutAllByRefresh(refreshToken, res);
  }
  @Post('2fa/setup')
  setup2FA(@Body() dto: Setup2FADto) {
    return this.authService.setup2FA(dto.userId);
  }

  @Post(':scope/2fa/verify')
  verify2FA(
    @Param('scope') scope: AuthScope,
    @Body() dto: Verify2FADto,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    return this.authService.verify2FA(dto.userId, dto.token, res, scope);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password/request')
  async requestChangePassword(@Req() req) {
    return this.authService.requestChangePassword(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify-action')
  async verify2FAForAction(@Req() req, @Body() dto: Verify2FAActionDto) {
    return this.authService.verify2FAForAction(
      req.user.sub,
      dto.action,
      dto.token,
    );
  }

  @Post('change-password')
  async changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto.actionToken, dto.newPassword);
  }

  @UseGuards(AuthGuard('google'))
  @Get('google')
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res({ passthrough: true }) res: any) {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';

    await this.authService.socialLogin(
      req.user,
      req.headers['user-agent'],
      ip,
      res,
      'buyer',
    );
    return res.redirect(process.env.BUYER_ENV);
  }

  @UseGuards(AuthGuard('facebook'))
  @Get('facebook')
  facebookLogin() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req, @Res({ passthrough: true }) res: any) {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';

    await this.authService.socialLogin(
      req.user,
      req.headers['user-agent'],
      ip,
      res,
      'buyer',
    );
    return res.redirect(process.env.BUYER_ENV);
  }

  @UseGuards(SuperAdminGuard)
  @Post('admins')
  createAdmin(@Body() dto: CreateAdminDto, @Req() req) {
    return this.authService.createAdmin(dto, req.user);
  }

  @UseGuards(SuperAdminGuard)
  @Post('admins/:id/approve')
  approveAdmin(@Param('id') id: number, @Req() req) {
    return this.authService.approveAdmin(+id, req.user);
  }

  @UseGuards(SuperAdminGuard)
  @Post('admins/:id/suspend')
  suspendAdmin(@Param('id') id: number, @Req() req) {
    return this.authService.suspendAdmin(+id, req.user);
  }
}
