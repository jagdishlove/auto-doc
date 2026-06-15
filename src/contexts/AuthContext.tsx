import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { validateToken } from '../services/githubService';

interface AuthContextType {
  token: string;
  user: User | null;
  isAuthenticating: boolean;
  authError: string | null;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('gh_auto_doc_token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticating(true);
      validateToken(storedToken)
        .then(gitUser => {
          if (gitUser) {
            setUser(gitUser);
          } else {
            localStorage.removeItem('gh_auto_doc_token');
          }
        })
        .finally(() => setIsAuthenticating(false));
    }
  }, []);

  const login = useCallback(async (newToken: string): Promise<boolean> => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const gitUser = await validateToken(newToken);
      if (gitUser) {
        setUser(gitUser);
        setToken(newToken);
        localStorage.setItem('gh_auto_doc_token', newToken);
        return true;
      } else {
        setAuthError("Invalid Token. Please check your permissions.");
        return false;
      }
    } catch {
      setAuthError("Connection failed.");
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken('');
    localStorage.removeItem('gh_auto_doc_token');
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticating, authError, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
