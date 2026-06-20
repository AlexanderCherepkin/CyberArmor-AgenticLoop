'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { apiFetch, apiFetchJson } from '@/lib/api/client';

export interface AuthUser {
  id: string;
  email: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  roles: { name: string }[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const me = await apiFetchJson<AuthUser>('/auth/me');
      setUser(me);
      return me;
    } catch {
      try {
        const refreshResponse = await apiFetch('/auth/refresh', { method: 'POST' });
        if (!refreshResponse.ok) {
          setUser(null);
          return null;
        }
        const me = await apiFetchJson<AuthUser>('/auth/me');
        setUser(me);
        return me;
      } catch {
        setUser(null);
        return null;
      }
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.detail || 'Login failed');
    }
    const me = await apiFetchJson<AuthUser>('/auth/me');
    setUser(me);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const response = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.detail || 'Registration failed');
    }
    const me = await apiFetchJson<AuthUser>('/auth/me');
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    login,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
