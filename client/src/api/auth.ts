import api from './client';
import type { User } from '../types';

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/login', data),
  register: (data: { email: string; password: string; name: string }) =>
    api.post<{ token: string; user: User }>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
};
