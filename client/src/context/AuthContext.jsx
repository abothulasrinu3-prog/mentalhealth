import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.data);
      setIsAuthenticated(true);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await axios.post(`${API_URL}/auth/login`, { email: normalizedEmail, password });
      const { token, ...userData } = response.data.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      // Network error handling
      if (!error.response && error.message === 'Network Error') {
        return {
          success: false,
          message: 'Cannot connect to server. Please make sure the backend is running on port 5000.'
        };
      }
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const payload = {
        ...userData,
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase()
      };
      const response = await axios.post(`${API_URL}/auth/register`, payload);
      const { token, ...newUser } = response.data.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(newUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      // Network error handling
      if (!error.response && error.message === 'Network Error') {
        return {
          success: false,
          message: 'Cannot connect to server. Please make sure the backend is running on port 5000.'
        };
      }
      
      const message = error.response?.data?.message 
        || error.response?.data?.errors?.map(e => e.msg).join(', ')
        || error.message 
        || 'Registration failed';
      return { 
        success: false, 
        message
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      login, 
      register, 
      logout, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
