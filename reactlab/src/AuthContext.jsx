import React, { createContext, useState, useEffect, useContext } from 'react';

const API_BASE = 'http://localhost:3001/api';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const fetchMe = async (jwt) => {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[fetchMe] USER FROM BACKEND:', data);
        setUser(data);
        return true;
      } else if (res.status === 403) {
        return await refreshToken(); 
      }
    } catch (err) {
      console.error('fetchMe error', err);
    }
    logout();
    return false;
  };

  // Odśwież token JWT
  const refreshToken = async () => {
    const storedRefresh = localStorage.getItem('refreshToken');
    if (!storedRefresh) return false;

    try {
      const res = await fetch(`${API_BASE}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefresh }),
      });

      if (!res.ok) throw new Error('Refresh failed');
      const { token: newToken } = await res.json();

      localStorage.setItem('token', newToken);
      setToken(newToken);
      return await fetchMe(newToken);
    } catch (err) {
      console.error('refreshToken error', err);
      logout();
      return false;
    }
  };

  // Logowanie użytkownika
  const login = async (jwt, refresh) => {
    localStorage.setItem('token', jwt);
    localStorage.setItem('refreshToken', refresh);
    setToken(jwt);
    await fetchMe(jwt);
  };

  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setToken(null);
  };

  
  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('token');
      if (stored) {
        setToken(stored);
        await fetchMe(stored);
      }
      setLoading(false);
    };
    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
