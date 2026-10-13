import { api } from './client';
import { Story, Comment } from '../types';

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const storiesApi = {
  getStories: (category?: string, search?: string, page = 0, size = 20) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search && search.trim()) params.append('search', search.trim());
    params.append('page', page.toString());
    params.append('size', size.toString());
    return api.get<PageResult<Story>>(`/stories?${params.toString()}`);
  },

  getStory: (id: string | number) =>
    api.get<Story>(`/stories/${id}`),

  createStory: (story: Partial<Story> & { isPrivate?: boolean; displayMode?: string }) =>
    api.post<Story>('/stories', story),

  updateStory: (id: string | number, story: Partial<Story>) =>
    api.put<Story>(`/stories/${id}`, story),

  deleteStory: (id: string | number) =>
    api.delete<void>(`/stories/${id}`),

  getMyStories: () =>
    api.get<Story[]>('/me/stories'),

  getMyDrafts: () =>
    api.get<Story[]>('/me/drafts'),

  toggleReaction: (storyId: string | number, reactionType: string) =>
    api.put<Story>(`/stories/${storyId}/reactions/${reactionType}`),

  bookmarkStory: (storyId: string | number) =>
    api.post<{ saved: boolean }>(`/stories/${storyId}/bookmark`),

  getComments: (storyId: string | number) =>
    api.get<Comment[]>(`/stories/${storyId}/comments`),

  addComment: (storyId: string | number, content: string, parentCommentId?: string | number) =>
    api.post<Comment>(`/stories/${storyId}/comments`, { content, parentCommentId }),

  addReply: (parentCommentId: string | number, content: string) =>
    api.post<Comment>(`/comments/${parentCommentId}/replies`, { content }),

  toggleCommentLike: (commentId: string | number) =>
    api.post<number>(`/comments/${commentId}/like`),

  deleteComment: (commentId: string | number) =>
    api.delete<void>(`/comments/${commentId}`),
};
