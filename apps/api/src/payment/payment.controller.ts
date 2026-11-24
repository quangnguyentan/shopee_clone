import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Redirect,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiAuthenticated,
  ApiControllerDocs,
} from '@/common/decorators/api-controller-docs.decorator';
import { AuthRole } from '@/common/decorators/auth-role.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaymentService } from './payment.service';

@ApiControllerDocs('Payments')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('orders/:id/retry')
  @AuthRole('buyer')
  @ApiAuthenticated()
  retryOrderPayment(
    @Param('id') orderId: string,
    @CurrentUser() user: { userId: number },
    @Req() request: Request,
  ) {
    return this.paymentService.retryPendingOrderPayment(
      orderId,
      user.userId,
      request.ip ?? '127.0.0.1',
    );
  }

  @Get('methods')
  getAvailableMethods() {
    return this.paymentService.getAvailableMethods();
  }

  @Get('vnpay/return')
  @Redirect()
  async vnpayReturn(@Query() params: Record<string, string>) {
    return { url: await this.paymentService.handleVnpayReturn(params) };
  }

  @Get('vnpay/ipn')
  vnpayIpn(@Query() params: Record<string, string>) {
    return this.paymentService.handleVnpayIpn(params);
  }

  @Get('momo/return')
  @Redirect()
  async momoReturn(@Query() params: Record<string, string>) {
    return { url: await this.paymentService.handleMomoReturn(params) };
  }

  @Post('momo/ipn')
  momoIpn(@Body() params: Record<string, string>) {
    return this.paymentService.handleMomoIpn(params);
  }

  @Post(':id/confirm-manual')
  @AuthRole('admin')
  confirmManualTransfer(@Param('id') id: string) {
    return this.paymentService.confirmManualTransfer(id);
  }
}
