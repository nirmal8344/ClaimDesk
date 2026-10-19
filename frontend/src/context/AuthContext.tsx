import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, Role } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: AuthResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: any) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (updated: Partial<AuthResponse>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(() => authService.getStoredUser());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      const stored = authService.getStoredUser();
      if (stored) {
        try {
          const profile = await authService.getMe();
          const refreshed: AuthResponse = {
            ...stored,
            fullName: profile.fullName,
            phoneNumber: profile.phoneNumber,
            address: profile.address,
            department: profile.department,
            employeeId: profile.employeeId,
            status: profile.status,
          };
          setUser(refreshed);
          localStorage.setItem('claimdesk_user', JSON.stringify(refreshed));
        } catch {
          // Token might be invalid
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    setUser(res);
    return res;
  };

  const register = async (data: any) => {
    const res = await authService.register(data);
    setUser(res);
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (updated: Partial<AuthResponse>) => {
    if (user) {
      const merged = { ...user, ...updated };
      setUser(merged);
      localStorage.setItem('claimdesk_user', JSON.stringify(merged));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
