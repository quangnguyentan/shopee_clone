import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';
import { Setup2FADto } from './dto/setup-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { Verify2FAActionDto } from './dto/verify-2fa-action.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('qr')
  getQRCode() {
    return this.authService.getQRCode();
  }

  @Post('qr/verify')
  verifyQRCode(
    @Body()
    body: {
      sessionId: string;
      userId: string;
    },
  ) {
    return this.authService.verifyQRCode(body.sessionId, body.userId);
  }

  @Get('qr/status/:sessionId')
  checkQRStatus(@Param('sessionId') sessionId: string) {
    return this.authService.checkQRStatus(sessionId);
  }

  @Post('register') register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: any) {
    return this.authService.login(dto.identifier, dto.password, res);
  }
  @Post('refresh')
  refresh(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const token = req.cookies['refreshToken'];
    return this.authService.refreshToken(token, res);
  }
  @Post('logout')
  logout(@Res({ passthrough: true }) res: any) {
    return this.authService.logout(res);
  }

  @Post('2fa/setup')
  setup2FA(@Body() dto: Setup2FADto) {
    return this.authService.setup2FA(dto.userId);
  }

  @Post('2fa/verify')
  verify2FA(@Body() dto: Verify2FADto, @Res({ passthrough: true }) res: any) {
    return this.authService.verify2FA(dto.userId, dto.token, res);
  }
  @UseGuards(JwtAuthGuard)
  @Get('get-profile')
  async getProfile(@Req() req) {
    try {
      const user = req.user;
      console.log(user);
      return user;
    } catch (error) {
      console.log(error);
    }
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
}
