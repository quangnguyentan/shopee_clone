import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envConfig } from './config/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ShopModule } from './shop/shop.module';
import { ProductModule } from './product/product.module';
import { ProductVariantModule } from './product-variant/product-variant.module';
import { VariantOptionModule } from './variant-option/variant-option.module';
import { OrderModule } from './order/order.module';
import { OrderItemModule } from './order-item/order-item.module';
import { CartModule } from './cart/cart.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { CategoryModule } from './category/category.module';
import { ProductCategoryModule } from './product-category/product-category.module';
import { ProductImageModule } from './product-image/product-image.module';
import { ProductReviewModule } from './product-review/product-review.module';
import { PaymentModule } from './payment/payment.module';
import { ShippingModule } from './shipping/shipping.module';
import { VoucherModule } from './voucher/voucher.module';
import { AddressModule } from './address/address.module';
import { ChatMessageModule } from './chat-message/chat-message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ...envConfig('.env'),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
        ssl: {
          rejectUnauthorized: false,
        },
        extra: {
          max: 5,
          connectionTimeoutMillis: 5000,
        },
      }),
    }),
    AuthModule,
    UserModule,
    ShopModule,
    ProductModule,
    ProductVariantModule,
    VariantOptionModule,
    OrderModule,
    OrderItemModule,
    CartModule,
    CartItemModule,
    CategoryModule,
    ProductCategoryModule,
    ProductImageModule,
    ProductReviewModule,
    PaymentModule,
    ShippingModule,
    VoucherModule,
    AddressModule,
    ChatMessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
