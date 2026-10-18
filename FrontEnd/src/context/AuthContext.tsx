import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AuthResponseData } from '../api/auth';
import { profileApi } from '../api/profile';
import { UserProfile } from '../types';

interface AuthContextType {
  token: string | null;
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (login: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, pseudonym: string, displayName?: string) => Promise<void>;
  logout: () => void;
  updateCurrentUserState: (updated: Partial<UserProfile>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('spilltea_token'));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('spilltea_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const profile = await profileApi.getMyProfile();
      if (profile) {
        setCurrentUser(profile);
        localStorage.setItem('spilltea_user', JSON.stringify(profile));
      }
    } catch (err) {
      // A stale/expired token must not leave an apparently authenticated user.
      localStorage.removeItem('spilltea_token');
      localStorage.removeItem('spilltea_user');
      setToken(null);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const handleAuthSuccess = (data: AuthResponseData) => {
    setToken(data.token);
    localStorage.setItem('spilltea_token', data.token);

    const updatedUser: UserProfile = {
      ...(currentUser || {} as UserProfile),
      pseudonym: data.pseudonym,
      displayName: data.displayName || data.pseudonym,
      avatar: data.avatar || currentUser?.avatar || '',
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('spilltea_user', JSON.stringify(updatedUser));
  };

  const login = async (loginId: string, pass: string) => {
    const res = await authApi.login({ login: loginId, password: pass });
    handleAuthSuccess(res);
  };

  const register = async (email: string, pass: string, pseudonym: string, displayName?: string) => {
    const res = await authApi.register({
      email,
      password: pass,
      pseudonym,
      displayName: displayName || pseudonym,
    });
    handleAuthSuccess(res);
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('spilltea_token');
    localStorage.removeItem('spilltea_user');
    localStorage.removeItem('spilltea_stories');
    localStorage.removeItem('spilltea_letters');
    localStorage.removeItem('spilltea_draft');
  };

  const updateCurrentUserState = (updated: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...updated };
      localStorage.setItem('spilltea_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        updateCurrentUserState,
        refreshUser,
      }}
    >
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
