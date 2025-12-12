export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  grade_level: number;
  language: string;
  birthday: string;
  gender: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  isMarkdown?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  grade_level: number;
  language: string;
  birthday: string;
  gender: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  username: string;
  email: string;
}

export interface ChatSession {
  session_id: string;
  created_at: string;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface AccountStats {
  total_sessions: number;
  total_messages: number;
  account_age_days: number;
  last_active?: string;
}
