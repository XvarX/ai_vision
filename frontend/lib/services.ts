import api from './api';
import type {
  User, Novel, Chapter, MergeRequest,
  LoginRequest, RegisterRequest, AuthResponse
} from './types';

// Auth Service
export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },
};

// Novels Service
export const novelService = {
  getNovels: async (): Promise<Novel[]> => {
    const response = await api.get<Novel[]>('/novels');
    return response.data;
  },

  getNovel: async (id: number): Promise<Novel> => {
    const response = await api.get<Novel>(`/novels/${id}`);
    return response.data;
  },

  createNovel: async (data: { title: string; description?: string }): Promise<Novel> => {
    const response = await api.post<Novel>('/novels', data);
    return response.data;
  },

  updateNovel: async (id: number, data: { title: string; description?: string }): Promise<Novel> => {
    const response = await api.put<Novel>(`/novels/${id}`, data);
    return response.data;
  },

  deleteNovel: async (id: number): Promise<void> => {
    await api.delete(`/novels/${id}`);
  },
};

// Chapters Service
export const chapterService = {
  getChapters: async (novelId: number): Promise<Chapter[]> => {
    const response = await api.get<Chapter[]>(`/novels/${novelId}/chapters`);
    return response.data;
  },

  getMainChapters: async (novelId: number): Promise<Chapter[]> => {
    const response = await api.get<Chapter[]>(`/novels/${novelId}/chapters/main`);
    return response.data;
  },

  getChapter: async (id: number): Promise<Chapter> => {
    const response = await api.get<Chapter>(`/chapters/${id}`);
    return response.data;
  },

  createChapter: async (novelId: number, data: {
    title: string;
    content: string;
    chapter_number: number;
    parent_chapter_id?: number;
    branch_type?: 'main' | 'fork' | 'merged';
  }): Promise<Chapter> => {
    const response = await api.post<Chapter>(`/novels/${novelId}/chapters`, data);
    return response.data;
  },

  updateChapter: async (id: number, data: { title: string; content: string }): Promise<Chapter> => {
    const response = await api.put<Chapter>(`/chapters/${id}`, data);
    return response.data;
  },

  deleteChapter: async (id: number): Promise<void> => {
    await api.delete(`/chapters/${id}`);
  },

  forkChapter: async (id: number, title: string, content: string): Promise<Chapter> => {
    const response = await api.post<Chapter>(`/chapters/${id}/fork`, null, {
      params: { title, content }
    });
    return response.data;
  },

  getForkChapters: async (id: number): Promise<Chapter[]> => {
    const response = await api.get<Chapter[]>(`/chapters/${id}/forks`);
    return response.data;
  },

  getMergedChapters: async (novelId: number): Promise<Chapter[]> => {
    const response = await api.get<Chapter[]>(`/novels/${novelId}/chapters/merged`);
    return response.data;
  },

  getMergedChaptersForParent: async (chapterId: number): Promise<Chapter[]> => {
    const response = await api.get<Chapter[]>(`/chapters/${chapterId}/merged`);
    return response.data;
  },
};

// Merge Requests Service
export const mergeRequestService = {
  getMergeRequests: async (novelId: number): Promise<MergeRequest[]> => {
    const response = await api.get<MergeRequest[]>(`/novels/${novelId}/merge-requests`);
    return response.data;
  },

  createMergeRequest: async (novelId: number, data: {
    from_chapter_id: number;
    review_comment?: string;
  }): Promise<MergeRequest> => {
    const response = await api.post<MergeRequest>(`/novels/${novelId}/merge-requests`, data);
    return response.data;
  },

  approveMergeRequest: async (id: number): Promise<MergeRequest> => {
    const response = await api.put<MergeRequest>(`/merge-requests/${id}/approve`);
    return response.data;
  },

  rejectMergeRequest: async (id: number, review_comment?: string): Promise<MergeRequest> => {
    const response = await api.put<MergeRequest>(`/merge-requests/${id}/reject`, null, {
      params: { review_comment }
    });
    return response.data;
  },

  canSubmitChapter: async (chapterId: number): Promise<{ can_submit: boolean; reason?: string }> => {
    const response = await api.get<{ can_submit: boolean; reason?: string }>(`/chapters/${chapterId}/can-submit`);
    return response.data;
  },
};
