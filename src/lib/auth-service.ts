import { AuthResponse } from '@/types/api';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

/**
 * Имя кастомного события, которое AuthService шлёт в `window` при любом
 * изменении auth-состояния (login / logout / token refresh). `useIsAuthenticated`
 * (и кто угодно ещё) слушает его, чтобы перечитать состояние без перезагрузки
 * страницы. Это нужно потому, что `storage` событие в браузере НЕ срабатывает
 * в той же вкладке, где `localStorage.setItem` был вызван — только в других.
 */
export const AUTH_CHANGED_EVENT = 'auth-changed';

function emitAuthChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export class AuthService {
  // Token Management
  static async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      emitAuthChanged();
    }
  }

  static async getAccessToken(): Promise<string | null> {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  }

  static async getRefreshToken(): Promise<string | null> {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }

  static async clearTokens(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      emitAuthChanged();
    }
  }

  // User Management
  static async setUser(user: any): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  static async getUser(): Promise<any | null> {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  // Auth State
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  // Save auth response
  static async saveAuthResponse(authResponse: AuthResponse): Promise<void> {
    await this.setTokens(authResponse.access_token, authResponse.refresh_token);
    if (authResponse.user) {
      await this.setUser(authResponse.user);
    }
  }

  // Logout
  static async logout(): Promise<void> {
    await this.clearTokens();
  }
}
