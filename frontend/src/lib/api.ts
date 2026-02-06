import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse } from './types';

function computeApiBaseUrl(): string {
  const origin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  // Prefer relative by default so same-origin deployments "just work"
  // without needing build-time env injection.
  return origin ? `${origin}/api` : '/api';
}

const API_URL = computeApiBaseUrl();

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse<unknown>>) => {
        const originalRequest = error.config as any;

        // Handle 401 Unauthorized - try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.client.post('/auth/refresh');
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear user data
            if (typeof window !== 'undefined') {
              localStorage.removeItem('user');
              window.location.href = '/login';
            }

            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: unknown): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data;
  }

  // Stream requests (SSE)
  async stream(
    url: string,
    data: unknown,
    onMessage: (chunk: string) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<void> {
    try {
      const response = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is null');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete?.();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete?.();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onMessage(parsed.content);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }
}

export const api = new ApiClient();
