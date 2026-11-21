import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ApiControllerDocs } from '@/common/decorators/api-controller-docs.decorator';
import { AuthRole } from '@/common/decorators/auth-role.decorator';
import { PaginationDto } from '@/base/base.dto';

@ApiControllerDocs('Vouchers')
@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @AuthRole('admin', 'seller')
  @Post()
  create(
    @Body() createVoucherDto: CreateVoucherDto,
    @CurrentUser() user: { userId: number; role: 'admin' | 'seller' },
  ) {
    return this.voucherService.create(createVoucherDto, user);
  }

  @AuthRole('admin', 'seller')
  @Get()
  findAll(
    @Query() query: PaginationDto,
    @CurrentUser() user: { userId: number; role: 'admin' | 'seller' },
  ) {
    return this.voucherService.findAll(user, query);
  }

  @AuthRole('admin', 'seller')
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { userId: number; role: 'admin' | 'seller' },
  ) {
    return this.voucherService.findOne(id, user);
  }

  @AuthRole('admin', 'seller')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
    @CurrentUser() user: { userId: number; role: 'admin' | 'seller' },
  ) {
    return this.voucherService.update(id, updateVoucherDto, user);
  }

  @AuthRole('admin', 'seller')
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: number; role: 'admin' | 'seller' },
  ) {
    return this.voucherService.remove(id, user);
  }
}
