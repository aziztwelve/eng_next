import { AuthResponse } from '@/types/api';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

export class AuthService {
  // Token Management
  static async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
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
