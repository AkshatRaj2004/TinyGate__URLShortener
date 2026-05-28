import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('tg_token'));
  const [loading, setLoading] = useState(true);

  // Re-hydrate user from API on mount if token exists
  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data.user);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback((tokenValue, userData) => {
    localStorage.setItem('tg_token', tokenValue);
    localStorage.setItem('tg_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tg_token');
    localStorage.removeItem('tg_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
