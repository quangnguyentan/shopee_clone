import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatMessageService } from './chat-message.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { AuthRole } from '@/common/decorators/auth-role.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import {
  ApiAuthenticated,
  ApiControllerDocs,
} from '@/common/decorators/api-controller-docs.decorator';

@ApiControllerDocs('Chat Messages')
@Controller('chat-message')
export class ChatMessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}

  @AuthRole('buyer')
  @ApiAuthenticated()
  @Get('shop/:shopId')
  findForBuyer(
    @Param('shopId') shopId: string,
    @CurrentUser() user: { userId: number },
  ) {
    return this.chatMessageService.findForBuyer(shopId, user.userId);
  }

  @AuthRole('buyer')
  @ApiAuthenticated()
  @Post('shop/:shopId')
  sendFromBuyer(
    @Param('shopId') shopId: string,
    @CurrentUser() user: { userId: number },
    @Body() dto: CreateChatMessageDto,
  ) {
    return this.chatMessageService.sendFromBuyer(shopId, user.userId, dto);
  }
}
