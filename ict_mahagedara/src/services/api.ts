import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User, 
  AccountStats 
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Authentication APIs
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Registration error details:', error);
      console.error('Sent data:', data);
      throw new Error(error.detail || JSON.stringify(error) || 'Registration failed');
    }

    return response.json();
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  },
};

// Chat APIs
export const chatApi = {
  createSession: async (): Promise<{ session_id: string }> => {
    const response = await fetch(`${API_URL}/chat/session`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    return response.json();
  },

  sendMessage: async (
    sessionId: string | null,
    message: string,
    mode: 'session' | 'stateless'
  ): Promise<{ response: string; session_id?: string }> => {
    const endpoint = mode === 'session' 
      ? `/chat/session/${sessionId}` 
      : '/chat/stateless';
    const body = { message };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send message');
    }

    return response.json();
  },
};

// Profile APIs
export const profileApi = {
  getProfile: async (): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to load profile');
    }

    return response.json();
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_URL}/profile/update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update profile');
    }

    return response.json();
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/profile/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to change password');
    }

    return response.json();
  },

  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/profile/delete`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete account');
    }

    return response.json();
  },

  getStats: async (): Promise<AccountStats> => {
    const response = await fetch(`${API_URL}/profile/stats`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to load statistics');
    }

    return response.json();
  },
};
