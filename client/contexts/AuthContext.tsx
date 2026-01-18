'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  organizations: Array<{
    organizationId: string;
    role: string;
  }>;
  activeOrganizationId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeOrganizationId: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, organizationName?: string) => Promise<void>;
  logout: () => void;
  switchOrganization: (organizationId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const storedToken = localStorage.getItem('jwtToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setActiveOrganizationId(userData.activeOrganizationId || null);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    const { token, user: userData } = response.data;

    localStorage.setItem('jwtToken', token);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(token);
    setUser(userData);
    setActiveOrganizationId(userData.activeOrganizationId || null);
  };

  const register = async (email: string, password: string, organizationName?: string) => {
    const response = await apiClient.register(email, password, organizationName);
    const { token, user: userData } = response.data;

    localStorage.setItem('jwtToken', token);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(token);
    setUser(userData);
    setActiveOrganizationId(userData.activeOrganizationId || null);
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setActiveOrganizationId(null);
  };

  const switchOrganization = async (organizationId: string) => {
    const response = await apiClient.switchOrganization(organizationId);
    const { token: newToken, activeOrganizationId: newActiveOrgId } = response.data;

    localStorage.setItem('jwtToken', newToken);
    
    // Update user with new active org
    if (user) {
      const updatedUser = {
        ...user,
        activeOrganizationId: newActiveOrgId,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }

    setToken(newToken);
    setActiveOrganizationId(newActiveOrgId);
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setActiveOrganizationId(userData.activeOrganizationId || null);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeOrganizationId,
        loading,
        login,
        register,
        logout,
        switchOrganization,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
