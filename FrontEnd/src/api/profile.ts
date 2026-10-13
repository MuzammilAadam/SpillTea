import { api } from './client';
import { UserProfile } from '../types';

export const profileApi = {
  getProfile: (pseudonym: string) =>
    api.get<UserProfile>(`/profiles/${pseudonym}`),

  getMyProfile: () =>
    api.get<UserProfile>('/me/profile'),

  updateProfile: (profile: Partial<UserProfile>) =>
    api.put<UserProfile>('/me/profile', profile),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<string>('/me/avatar', formData);
  },
};
