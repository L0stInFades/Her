import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

interface SendMessageDto {
  conversationId: string;
  content: string;
  model?: string;
}

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async sendMessage(userId: string, data: SendMessageDto) {
    const { conversationId, content, model } = data;

    // Get conversation
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this conversation');
    }

    // Create user message
    const userMessage = await this.prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content,
      },
    });

    // Prepare messages for AI (reverse to chronological order)
    const aiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> =
      conversation.messages.reverse().map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

    aiMessages.push({
      role: 'user',
      content,
    });

    // Get user's API key if they have one
    const userSettings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    const apiKey = userSettings?.openRouterApiKey ?? undefined;
    const selectedModel = model || conversation.model || userSettings?.preferredModel || 'openai/gpt-4o';

    // Stream the response
    return this.aiService.streamChatCompletion(
      aiMessages,
      selectedModel,
      apiKey,
      (chunk) => {
        // Handle streaming chunk
      },
      () => {
        // Stream complete
      },
      (error) => {
        // Handle error
      }
    );
  }

  async regenerateMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.conversation.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this message');
    }

    // Get messages before this one
    const messagesBefore = message.conversation.messages.filter(
      (m) => new Date(m.createdAt) < new Date(message.createdAt)
    );

    // Prepare messages for AI
    const aiMessages = messagesBefore.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    // Get user's API key
    const userSettings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    const apiKey = userSettings?.openRouterApiKey ?? undefined;

    return this.aiService.streamChatCompletion(
      aiMessages,
      message.conversation.model,
      apiKey,
      () => {},
      () => {},
      () => {}
    );
  }
}
