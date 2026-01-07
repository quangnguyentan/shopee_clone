import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { SessionModule } from './session/session.module';
import { AssetModule } from './assets/assets.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
console.log(process.env.NODE_ENV);
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV
        ? `.env.${process.env.NODE_ENV}.local`
        : '.env.development.local',
      ignoreEnvFile: false,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        return {
          type: 'postgres',
          url,
          autoLoadEntities: true,
          synchronize: true,
          extra: {
            max: 1,
            idleTimeoutMillis: 0,
            connectionTimeoutMillis: 15000,
          },
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
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
    SessionModule,
    AssetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
