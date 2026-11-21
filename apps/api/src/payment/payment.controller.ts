import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';
import { AuthRole } from '@/common/decorators/auth-role.decorator';

@ApiControllerDocs('Payments')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @AuthRole('admin')
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @AuthRole('admin')
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  @AuthRole('admin')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Patch(':id')
  @AuthRole('admin')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  @AuthRole('admin')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
