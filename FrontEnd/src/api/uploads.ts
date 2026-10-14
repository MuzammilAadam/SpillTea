import { api } from './client';
import { UploadResponse } from '../types';

export const uploadsApi = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<UploadResponse>('/me/uploads/images', formData);
  },

  getMyUploadedImages: (): Promise<UploadResponse[]> =>
    api.get<UploadResponse[]>('/me/uploads/images'),

  deleteUploadedImage: (id: number | string): Promise<void> =>
    api.delete<void>(`/me/uploads/images/${id}`),
};
