import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import API_BASE_URL from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      if (!response.ok) throw new Error('Refresh revoked');
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.token;
    } catch (err) {
      console.error('Session refresh failed:', err);
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
          const response = await fetch(`${API_BASE_URL}/api/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Access token expired, try to refresh
            const newToken = await refreshSession();
            if (newToken) {
              const retryResponse = await fetch(`${API_BASE_URL}/api/profile`, {
                headers: { 'Authorization': `Bearer ${newToken}` }
              });
              if (retryResponse.ok) {
                const userData = await retryResponse.json();
                setUser(userData);
              }
            }
          }
        } catch (err) {
          console.error('Initial profile fetch failed:', err);
        }
      } else if (refreshToken) {
        // Attempt to auto-refresh session if access token is missing but refresh token exists
        const newToken = await refreshSession();
        if (newToken) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
              headers: { 'Authorization': `Bearer ${newToken}` }
            });
            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
            }
          } catch (err) {
            console.error('Error fetching profile after refresh:', err);
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
    const socket = io(API_BASE_URL);

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
    // NEVER save user object to localStorage! MongoDB is the single source of truth.
    setUser(userData);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      } catch (err) {
        console.error('Server logout failed:', err);
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
