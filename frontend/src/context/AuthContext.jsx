import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

function clearStoredSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function isJwtLike(token) {
  return typeof token === 'string' && token.split('.').length === 3;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    return isJwtLike(savedToken) ? savedToken : null;
  });

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!isJwtLike(savedToken) || !savedUser) {
      clearStoredSession();
      setToken(null);
      setUser(null);
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    } catch (error) {
      clearStoredSession();
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, []);

  const login = async (credentials) => {
    try {
      clearStoredSession();
      setToken(null);
      setUser(null);
      const { data } = await authApi.login(credentials);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      const data = error.response?.data;
      const message =
        (data && typeof data === 'object' && data.message) ||
        (typeof data === 'string' ? data : null) ||
        error.message ||
        'Unable to sign in. Make sure the backend is running on port 8084 and the frontend page is refreshed.';
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearStoredSession();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
