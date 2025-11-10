import api from './api';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/register', { name, email, password });
    const { user, token, refreshToken } = response.data.data;
    Cookies.set('token', token, { expires: 7 });
    Cookies.set('refreshToken', refreshToken, { expires: 30 });
    return { user, token, refreshToken };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { email, password });
    const { user, token, refreshToken } = response.data.data;
    Cookies.set('token', token, { expires: 7 });
    Cookies.set('refreshToken', refreshToken, { expires: 30 });
    return { user, token, refreshToken };
  },

  async logout(): Promise<void> {
    Cookies.remove('token');
    Cookies.remove('refreshToken');
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset', { token, password });
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('token');
  },

  getToken(): string | undefined {
    return Cookies.get('token');
  },
};

