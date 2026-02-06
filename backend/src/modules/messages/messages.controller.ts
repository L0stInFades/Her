import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { SendMessageDto } from './dto/send-message.dto';
import { AppConfigService } from '../app-config/app-config.service';
import { UsageService } from '../usage/usage.service';
import { ActiveStreamsService } from './active-streams.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private aiService: AiService,
    private prisma: PrismaService,
    private usersService: UsersService,
    private appConfigService: AppConfigService,
    private usageService: UsageService,
    private activeStreams: ActiveStreamsService,
  ) {}

  @Post('stream')
  async streamMessage(
    @GetUser() user: any,
    @Body() body: SendMessageDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const acquired = this.activeStreams.tryAcquire(user.id);
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      this.activeStreams.release(user.id);
    };

    if (!acquired.ok) {
      return res.status(429).json({
        error: 'Too many concurrent streams',
        data: { active: acquired.active, max: acquired.max },
      });
    }

    const { conversationId, content, model } = body;
    const appConfig = await this.appConfigService.getConfig();

    // Usage limits (monthly)
    try {
      await this.usageService.assertWithinLimitOrThrow(user.id);
    } catch (e: any) {
      release();
      if (e?.code === 'QUOTA_EXCEEDED') {
        return res.status(429).json({ error: 'Monthly quota exceeded', data: e.snapshot });
      }
      return res.status(500).json({ error: 'Failed to check quota' });
    }

    // Get conversation
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: appConfig.maxContextMessages,
        },
      },
    });

    if (!conversation) {
      release();
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== user.id) {
      release();
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Create user message
    await this.prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content,
      },
    });

    // Prepare messages for AI (reverse back to chronological order)
    const aiMessages = conversation.messages.reverse().map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    aiMessages.push({
      role: 'user',
      content,
    });

    // Get user's API key (decrypted)
    const userSettings = await this.usersService.getUserSettingsDecrypted(user.id);
    const canByok = user.plan === 'PRO_ART' && appConfig.allowUserApiKeys;
    const userApiKey = canByok ? userSettings?.openRouterApiKey ?? undefined : undefined;
    // Server policy: can require BYOK for ProArt while still allowing Art to use the server key.
    if (appConfig.requireUserApiKey && user.plan === 'PRO_ART' && !userApiKey) {
      release();
      return res.status(400).json({ error: 'User API key is required for ProArt by server policy' });
    }
    const apiKey = userApiKey;
    let selectedModel = model || conversation.model || userSettings?.preferredModel || 'openai/gpt-4o';
    // Enforce enabled models
    const enabled = await this.appConfigService.getEnabledModels();
    if (!enabled.some((m) => m.id === selectedModel)) {
      selectedModel = await this.appConfigService.getDefaultModelId();
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullContent = '';
    let completed = false;

    // Abort upstream request when client disconnects
    const abortController = new AbortController();
    req.on('close', () => {
      abortController.abort();
      release();
    });

    try {
      await this.aiService.streamChatCompletion(
        aiMessages,
        selectedModel,
        apiKey,
        (chunk) => {
          if (abortController.signal.aborted) return;
          fullContent += chunk;
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        },
        () => {
          if (completed) return;
          completed = true;
          release();

          // Stream complete - save the assistant message
          this.prisma.message
            .create({
              data: {
                conversationId,
                role: 'assistant',
                content: fullContent,
              },
            })
            .catch((error) => {
              console.error('Failed to save message:', error);
            });

          res.write('data: [DONE]\n\n');
          res.end();

          // Record usage (best-effort)
          this.usageService
            .recordUsage({ userId: user.id, userContent: content, assistantContent: fullContent })
            .catch(() => {});
        },
        (error) => {
          if (completed) return;
          completed = true;
          release();

          console.error('Stream error:', error?.message || 'Unknown error');
          res.write(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`);
          res.end();
        },
        abortController.signal,
      );
    } catch (error) {
      if (completed) return;
      completed = true;
      release();

      console.error('AI error:', error?.message || 'Unknown error');
      res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`);
      res.end();
    }
  }
}
