import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Get()
  async findAll(@GetUser() user: any) {
    const conversations = await this.conversationsService.findAll(user.id);
    return {
      success: true,
      data: conversations,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: any) {
    const conversation = await this.conversationsService.findOne(id, user.id);
    return {
      success: true,
      data: conversation,
    };
  }

  @Post()
  async create(@GetUser() user: any, @Body() body: CreateConversationDto) {
    const conversation = await this.conversationsService.create(user.id, body);
    return {
      success: true,
      data: conversation,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() body: UpdateConversationDto,
  ) {
    const conversation = await this.conversationsService.update(id, user.id, body);
    return {
      success: true,
      data: conversation,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @GetUser() user: any) {
    return this.conversationsService.delete(id, user.id);
  }
}
