import { api } from './client';

export interface AuthResponseData {
  token: string;
  pseudonym: string;
  displayName: string;
  avatar?: string;
  role: string;
}

export const authApi = {
  register: (data: { email: string; password: string; pseudonym: string; displayName?: string }) =>
    api.post<AuthResponseData>('/auth/register', data),

  login: (data: { login: string; password: string }) =>
    api.post<AuthResponseData>('/auth/login', data),

  getMe: () =>
    api.get<any>('/me/profile'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<void>('/auth/change-password', data),
};
