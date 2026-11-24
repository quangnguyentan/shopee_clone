import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '@/shop/entities/shop.entity';
import { User } from '@/user/entities/user.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

@Injectable()
export class ChatMessageService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly messages: Repository<ChatMessage>,
    @InjectRepository(Shop)
    private readonly shops: Repository<Shop>,
  ) {}

  async findForBuyer(shopId: string, buyerId: number) {
    await this.assertShopExists(shopId);
    return this.messages.find({
      where: { shop: { id: shopId }, buyer_id: buyerId },
      relations: ['sender'],
      order: { created_at: 'ASC', id: 'ASC' },
    });
  }

  async sendFromBuyer(
    shopId: string,
    buyerId: number,
    dto: CreateChatMessageDto,
  ) {
    await this.assertShopExists(shopId);
    const message = this.messages.create({
      shop: { id: shopId } as Shop,
      sender: { id: String(buyerId) } as User,
      buyer_id: buyerId,
      message: dto.message.trim(),
    });
    return this.messages.save(message);
  }

  private async assertShopExists(shopId: string) {
    const shop = await this.shops.findOne({ where: { id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');
  }
}
