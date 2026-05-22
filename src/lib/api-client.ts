import { ApiError } from '@/types/api';
import { AuthService } from './auth-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

// Endpoints, на которых 401 не должен триггерить глобальный logout-redirect:
// сам логин/регистрация естественно отвечают 401 при неверных кредах — пусть
// форма /auth обработает ошибку сама и покажет toast.
const AUTH_BYPASS_PREFIXES = ['/auth/login', '/auth/register', '/auth/refresh'];

/**
 * Реакция на 401 от защищённого endpoint'а: чистим локальные токены и
 * редиректим на `/auth?redirect=<current>`. Это покрывает кейс «токен
 * протух / отозван» — после редиректа пользователь логинится и
 * возвращается на ту же страницу.
 */
async function handleUnauthorized(): Promise<void> {
  if (typeof window === 'undefined') return;

  await AuthService.logout();

  const { pathname, search } = window.location;
  // Уже на странице авторизации — не делаем ничего, иначе зациклится.
  if (pathname.startsWith('/auth')) return;

  const redirect = encodeURIComponent(pathname + search);
  window.location.href = `/auth?redirect=${redirect}`;
}

export class ApiClient {
  private static baseURL = API_BASE_URL;

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    const token = await AuthService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        // Глобальный 401-handler. Не триггерим на auth-эндпоинтах сами —
        // там 401 = invalid creds, форма /auth должна показать toast.
        if (response.status === 401) {
          const isAuthFlow = AUTH_BYPASS_PREFIXES.some((p) => endpoint.startsWith(p));
          if (!isAuthFlow) {
            void handleUnauthorized();
          }
        }

        if (isJson) {
          const errorData = await response.json();
          throw {
            message: errorData.message || 'An error occurred',
            statusCode: response.status,
            errors: errorData.errors,
          } as ApiError;
        } else {
          throw {
            message: `HTTP ${response.status}: ${response.statusText}`,
            statusCode: response.status,
          } as ApiError;
        }
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      if (isJson) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      // Network errors or other fetch errors
      if (error instanceof TypeError) {
        throw {
          message: 'Network error. Please check your connection.',
          statusCode: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  static async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  static async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}
