export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Novel {
  id: number;
  title: string;
  description: string | null;
  author_id: number;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: number;
  novel_id: number;
  title: string;
  content: string;
  chapter_number: number;
  parent_chapter_id: number | null;
  branch_type: 'main' | 'fork' | 'merged';
  author_id: number;
  author_username?: string;
  parent_chapter_title?: string;
  created_at: string;
  updated_at: string;
}

export interface MergeRequest {
  id: number;
  from_chapter_id: number;
  to_novel_id: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: number;
  review_comment: string | null;
  created_at: string;
  reviewed_at: string | null;
  from_chapter_title?: string;
  requester_username?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
