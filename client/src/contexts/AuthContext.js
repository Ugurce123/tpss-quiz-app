import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { 
  isTokenValid, 
  sanitizeInput,
  setupSessionTimeout 
} from '../utils/security';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkTokenValidity = useCallback(async () => {
    try {
      await axios.get(API_ENDPOINTS.QUIZ_STATS);
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isTokenValid(token)) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkTokenValidity();
      // Session timeout setup
      setupSessionTimeout(30); // 30 dakika
    } else {
      // Geçersiz token varsa temizle
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setLoading(false);
    }
  }, [checkTokenValidity]);



  const login = async (email, password) => {
    try {
      // Input sanitization
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);
      
      const response = await axios.post(API_ENDPOINTS.LOGIN, {
        email: sanitizedEmail,
        password: sanitizedPassword
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Giriş başarısız' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(API_ENDPOINTS.REGISTER, {
        username,
        email,
        password
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Kayıt başarısız' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.QUIZ_STATS);
      // Stats endpoint'inden kullanıcı bilgilerini al ve güncelle
      const updatedUser = {
        ...user,
        currentLevel: response.data.currentLevel,
        completedLevels: response.data.completedLevels
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      return user;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    refreshUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};