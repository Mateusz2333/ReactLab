// src/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const API_BASE = 'http://localhost:3000/api';

export const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Fetch current user profile
  const fetchMe = async (jwt) => {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        return true;
      }
      if (res.status === 403) {
        // Token expired or invalid — try refresh
        return await refreshToken();
      }
    } catch (err) {
      console.error('fetchMe error', err);
    }
    logout();
    return false;
  };

  // Refresh JWT using refreshToken
  const refreshToken = async () => {
    const storedRefresh = localStorage.getItem('refreshToken');
    if (!storedRefresh) return false;
    try {
      const res = await fetch(`${API_BASE}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefresh })
      });
      if (!res.ok) throw new Error('Refresh failed');
      const { token: newToken } = await res.json();
      localStorage.setItem('token', newToken);
      setToken(newToken);
      return await fetchMe(newToken);
    } catch {
      logout();
      return false;
    }
  };

  // Log in: store tokens and fetch profile
  const login = async (jwt, refresh) => {
    localStorage.setItem('token', jwt);
    localStorage.setItem('refreshToken', refresh);
    setToken(jwt);
    await fetchMe(jwt);
  };

  // Log out: clear state and storage
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setToken(null);
  };

  // On mount, try to load existing token
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      setToken(stored);
      fetchMe(stored);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);
