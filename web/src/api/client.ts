import { APIError } from '../types/api';

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { timeoutMs = 10000, headers, ...customConfig } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    const config: RequestInit = {
      ...customConfig,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      clearTimeout(id);

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json().catch(() => ({})) : null;

      if (!response.ok) {
        throw new APIError(
          response.status,
          data?.error || data?.message || `HTTP error ${response.status}: ${response.statusText}`,
          data
        );
      }

      return data as T;
    } catch (err: unknown) {
      clearTimeout(id);
      if (err instanceof APIError) {
        throw err;
      }
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new APIError(408, 'Request timed out');
      }
      throw new APIError(
        500,
        err instanceof Error ? err.message : 'Network communication failure'
      );
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new APIClient();
