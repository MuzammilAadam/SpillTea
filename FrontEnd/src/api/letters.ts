import { api } from './client';
import { UnsentLetter } from '../types';
import { PageResult } from './stories';

export const lettersApi = {
  getPublicLetters: (page = 0, size = 20) =>
    api.get<PageResult<UnsentLetter>>(`/public/letters?page=${page}&size=${size}`),

  getMyLetters: () =>
    api.get<UnsentLetter[]>('/me/letters'),

  createLetter: (letter: Partial<UnsentLetter>) =>
    api.post<UnsentLetter>('/letters', letter),

  updateLetter: (id: string | number, letter: Partial<UnsentLetter>) =>
    api.put<UnsentLetter>(`/letters/${id}`, letter),

  sealLetter: (id: string | number) =>
    api.post<UnsentLetter>(`/letters/${id}/seal`),

  deleteLetter: (id: string | number) =>
    api.delete<void>(`/letters/${id}`),
};
