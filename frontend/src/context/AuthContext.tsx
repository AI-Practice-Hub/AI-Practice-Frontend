"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getToken, setToken as saveToken, removeToken } from '@/lib/auth';
import { User, AuthState, LoginRequest, SignupRequest, AuthResponse } from '@/types';
import { ROUTES } from '@/utils/constants';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (credentials: SignupRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      const storedToken = getToken();
      if (storedToken) {
        setTokenState(storedToken);
        // TODO: Optionally fetch user info from backend using token
        // For now, we'll just set authenticated state
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await api.post<AuthResponse>('/login', credentials);
      const { access_token } = response.data;
      
      if (access_token) {
        // Save token to localStorage
        saveToken(access_token);
        setTokenState(access_token);
        
        // TODO: Optionally decode JWT to get user info
        // For now, we'll set a basic user object
        setUser({ id: 0, email: credentials.email });
        
        // Redirect to chat page
        router.push(ROUTES.CHAT);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (credentials: SignupRequest) => {
    try {
      await api.post('c/signup', credentials);
      // After successful signup, redirect to login
      router.push(ROUTES.LOGIN);
    } catch (error: any) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear token from localStorage
    removeToken();
    setTokenState(null);
    setUser(null);
    
    // Redirect to login page
    router.push(ROUTES.LOGIN);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
