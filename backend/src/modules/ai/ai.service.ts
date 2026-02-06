import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const REQUEST_TIMEOUT = 30000;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openrouterClient: AxiosInstance;
  private defaultApiKey: string;

  constructor(private configService: ConfigService) {
    this.defaultApiKey = this.configService.get('OPENROUTER_API_KEY') || '';

    this.openrouterClient = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': this.configService.get('OPENROUTER_SITE_URL') || 'http://localhost:3000',
        'X-Title': this.configService.get('OPENROUTER_APP_NAME') || 'Her',
      },
    });
  }

  async chatCompletion(
    messages: OpenRouterMessage[],
    model: string = 'openai/gpt-4o',
    apiKey?: string,
    stream: boolean = false
  ): Promise<OpenRouterResponse> {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey || this.defaultApiKey}`,
      };

      const response = await this.openrouterClient.post<OpenRouterResponse>(
        '/chat/completions',
        {
          model,
          messages,
          stream,
        },
        { headers }
      );

      return response.data;
    } catch (error) {
      this.logger.error('OpenRouter API error:', error?.message || 'Unknown error');
      throw new InternalServerErrorException('Failed to get AI response');
    }
  }

  async streamChatCompletion(
    messages: OpenRouterMessage[],
    model: string = 'openai/gpt-4o',
    apiKey?: string,
    onChunk: (chunk: string) => void = () => {},
    onComplete: () => void = () => {},
    onError: (error: Error) => void = () => {},
    signal?: AbortSignal,
  ): Promise<void> {
    let completed = false;

    const safeComplete = () => {
      if (completed) return;
      completed = true;
      onComplete();
    };

    const safeError = (error: Error) => {
      if (completed) return;
      completed = true;
      onError(error);
    };

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey || this.defaultApiKey}`,
      };

      const response = await this.openrouterClient.post(
        '/chat/completions',
        {
          model,
          messages,
          stream: true,
        },
        {
          headers,
          responseType: 'stream',
          timeout: 120000, // Longer timeout for streaming
          signal,
        }
      );

      // If client disconnects, destroy the upstream stream
      if (signal) {
        signal.addEventListener('abort', () => {
          response.data.destroy();
        });
      }

      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              safeComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                onChunk(content);
              }
            } catch (e) {
              this.logger.error('Failed to parse SSE data:', e?.message || 'Unknown error');
            }
          }
        }
      });

      response.data.on('end', () => {
        safeComplete();
      });

      response.data.on('error', (error: Error) => {
        this.logger.error('Stream error:', error?.message || 'Unknown error');
        safeError(new Error('Stream error occurred'));
      });
    } catch (error) {
      this.logger.error('OpenRouter streaming error:', error?.message || 'Unknown error');
      safeError(new Error('Failed to connect to AI service'));
    }
  }

  async getAvailableModels(apiKey?: string): Promise<any[]> {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey || this.defaultApiKey}`,
      };

      const response = await this.openrouterClient.get('/models', { headers });
      return response.data.data || [];
    } catch (error) {
      this.logger.error('Failed to fetch models:', error?.message || 'Unknown error');
      return [];
    }
  }
}
