import { api, resolveMediaUrl } from './client';
import { KindredPage, KindredProfile, PeopleSearchResult, UserProfile } from '../types';
import { PageResult } from './stories';

export const profileApi = {
  getProfile: (pseudonym: string) =>
    api.get<UserProfile>(`/profiles/${pseudonym}`).then(profile => ({ ...profile, avatar: resolveMediaUrl(profile.avatar) })),

  searchPeople: (query: string, page = 0, size = 20) =>
    api.get<PageResult<PeopleSearchResult>>(`/profiles/search?q=${encodeURIComponent(query.trim())}&page=${page}&size=${size}`),

  getMyProfile: () =>
    api.get<UserProfile>('/me/profile').then(profile => ({ ...profile, avatar: resolveMediaUrl(profile.avatar) })),

  getStats: (userId: string) =>
    api.get<{ storiesCount: number; kindredCount: number; myKindredCount: number }>(`/profiles/${userId}/stats`),

  follow: (userId: string) => api.put<{ storiesCount: number; kindredCount: number; myKindredCount: number }>(`/profiles/${userId}/follow`),
  unfollow: (userId: string) => api.delete<{ storiesCount: number; kindredCount: number; myKindredCount: number }>(`/profiles/${userId}/follow`),
  relationship: (userId: string) => api.get<{ following: boolean; mutualKindred: boolean }>(`/profiles/${userId}/relationship`),
  getKindred: (userId: string, page = 0, size = 20) => api.get<KindredPage>(`/profiles/${userId}/kindred?page=${page}&size=${size}`),
  getMyKindred: (userId: string, page = 0, size = 20) => api.get<KindredPage>(`/profiles/${userId}/my-kindred?page=${page}&size=${size}`),

  updateProfile: (profile: Partial<UserProfile>) =>
    api.patch<UserProfile>('/me/profile', profile).then(saved => ({ ...saved, avatar: resolveMediaUrl(saved.avatar) })),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ avatar: string }>('/me/profile/photo', formData).then(result => ({ ...result, avatar: resolveMediaUrl(result.avatar) }));
  },
};
