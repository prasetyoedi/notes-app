export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Tag {
  id: number;
  name: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Note {
  id: number;
  title: string;
  content: string | null;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  is_archived: boolean;
}

export interface NoteWithTags extends Note {
  tags: { id: number; name: string }[];
}

export interface NotesTags {
  note_id: number;
  tag_id: number;
}

export interface AuthPayload {
  id: number;
  email: string;
}

export interface ApiResponse<T = any> {
  status: 'Success' | 'Error';
  message: string;
  data?: T;
}