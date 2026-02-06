import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetUser } from '../auth/decorators/get-user.decorator';

interface CreateConversationDto {
  title?: string;
  model?: string;
}

interface UpdateConversationDto {
  title?: string;
  model?: string;
}

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this conversation');
    }

    return conversation;
  }

  async create(userId: string, data: CreateConversationDto) {
    return this.prisma.conversation.create({
      data: {
        userId,
        title: data.title || 'New Chat',
        model: data.model || 'openai/gpt-4o',
      },
    });
  }

  async update(id: string, userId: string, data: UpdateConversationDto) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this conversation');
    }

    return this.prisma.conversation.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this conversation');
    }

    await this.prisma.conversation.delete({
      where: { id },
    });

    return { success: true, message: 'Conversation deleted successfully' };
  }
}
