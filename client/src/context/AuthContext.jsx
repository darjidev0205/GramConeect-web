import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api, { API_BASE_URL, getErrorMessage } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const response = await api.post('/api/auth/refresh', { refreshToken });
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.token;
    } catch (err) {
      console.error('Session refresh failed:', getErrorMessage(err));
      logout();
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token) {
        try {
          const response = await api.get('/api/profile');
          setUser(response.data);
        } catch (err) {
          // Token expired or invalid, try to refresh
          const newToken = await refreshSession();
          if (newToken) {
            try {
              const retryResponse = await api.get('/api/profile');
              setUser(retryResponse.data);
            } catch (retryErr) {
              console.error('Retry profile fetch failed:', getErrorMessage(retryErr));
            }
          }
        }
      } else if (refreshToken) {
        const newToken = await refreshSession();
        if (newToken) {
          try {
            const response = await api.get('/api/profile');
            setUser(response.data);
          } catch (err) {
            console.error('Error fetching profile after refresh:', getErrorMessage(err));
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Listen to Socket.io updates for Profile Sync
  useEffect(() => {
    if (!user) return;
    const socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      socket.emit('join_user', user._id || user.id);
    });

    socket.on('new_notification', (data) => {
      if (data && data.type === 'profile_sync') {
        setUser(data.user);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id || user?.id]);

  const login = (userData, token, refreshToken) => {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    setUser(userData);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/api/auth/logout', { refreshToken });
      } catch (err) {
        console.error('Server logout failed:', getErrorMessage(err));
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshSession, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
