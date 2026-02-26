import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5555';

  const fetchUser = async () => {
    const token = localStorage.getItem('uniplay_token');
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('uniplay_user', JSON.stringify(data.user));
          setUser(data.user);
        } else if (res.status === 401) {
          logout();
        }
      } catch (error) { }
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('uniplay_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchUser();
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token && data.user) {
        localStorage.setItem('uniplay_token', data.token);
        localStorage.setItem('uniplay_user', JSON.stringify(data.user));
        setUser(data.user);
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (err) {
      setUser(null);
      localStorage.removeItem('uniplay_user');
      localStorage.removeItem('uniplay_token');
      setLoading(false);
      return false;
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const payload = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        studentId: userData.studentId
      };
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        data = { error: 'Response not JSON', status: res.status };
      }
      if (res.ok && data.token && data.user) {
        localStorage.setItem('uniplay_token', data.token);
        localStorage.setItem('uniplay_user', JSON.stringify(data.user));
        setUser(data.user);
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (err) {
      setUser(null);
      localStorage.removeItem('uniplay_user');
      localStorage.removeItem('uniplay_token');
      setLoading(false);
      return false;
    }
  };

  const googleLogin = async (token) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (res.ok && data.token && data.user) {
        localStorage.setItem('uniplay_token', data.token);
        localStorage.setItem('uniplay_user', JSON.stringify(data.user));
        setUser(data.user);
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (err) {
      console.error('Google login error:', err);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('uniplay_user');
    localStorage.removeItem('uniplay_token');
  };

  const refreshUser = async () => {
    try {
      await fetchUser();
    } catch (error) { }
  };

  const value = {
    user,
    login,
    signup,
    googleLogin,
    logout,
    loading,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
