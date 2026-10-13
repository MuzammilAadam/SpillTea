import { api } from './client';
import { MoodboardItem } from '../types';

export interface MoodboardResponse {
  id: number;
  title: string;
  description: string;
  themeConfig: string;
  published: boolean;
  version: number;
  owner: boolean;
  cards: MoodboardItem[];
}

export interface SaveMoodboardPayload {
  title?: string;
  description?: string;
  themeConfig?: string;
  version?: number;
  cards: Partial<MoodboardItem>[];
}

export const moodboardApi = {
  getMyMoodboard: () =>
    api.get<MoodboardResponse>('/moodboards/me'),

  getPublicMoodboard: (pseudonym: string) =>
    api.get<MoodboardResponse>(`/profiles/${pseudonym}/moodboard`),

  saveDraft: (data: SaveMoodboardPayload) =>
    api.put<MoodboardResponse>('/moodboards/me/draft', data),

  publish: () =>
    api.post<MoodboardResponse>('/moodboards/me/publish'),

  discardDraft: () =>
    api.post<MoodboardResponse>('/moodboards/me/discard-draft'),

  addCard: (card: Partial<MoodboardItem>) =>
    api.post<MoodboardItem>('/moodboards/me/cards', card),

  updateCard: (cardId: string | number, card: Partial<MoodboardItem>) =>
    api.put<MoodboardItem>(`/moodboards/me/cards/${cardId}`, card),

  deleteCard: (cardId: string | number) =>
    api.delete<void>(`/moodboards/me/cards/${cardId}`),

  reorderCards: (orders: { cardId: number; displayOrder: number }[]) =>
    api.put<MoodboardItem[]>('/moodboards/me/cards/reorder', { orders }),

  uploadCardImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<string>('/moodboards/me/cards/image', formData);
  },
};
