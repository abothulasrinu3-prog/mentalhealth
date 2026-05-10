import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DEMO_USERS_KEY = 'mindcare_demo_users';
const DEMO_TOKEN_PREFIX = 'demo-token:';

const readDemoUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeDemoUsers = (users) => {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
};

const createDemoToken = (email) => `${DEMO_TOKEN_PREFIX}${email}`;

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const isNetworkFailure = (error) =>
  !error.response || error.response?.status === 404 || error.message === 'Network Error';

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

  const storeAuthenticatedUser = (userData, token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setIsAuthenticated(true);
  };

  const syncDemoUserToBackend = async (demoUser) => {
    if (!demoUser?.email || !demoUser?.password) {
      return null;
    }

    const normalizedEmail = normalizeEmail(demoUser.email);

    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: normalizedEmail,
        password: demoUser.password
      });
      return loginResponse.data.data;
    } catch (loginError) {
      if (loginError.response?.status !== 401) {
        throw loginError;
      }
    }

    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      name: demoUser.name?.trim() || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      password: demoUser.password,
      age: demoUser.age,
      gender: demoUser.gender
    });

    return registerResponse.data.data;
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token?.startsWith(DEMO_TOKEN_PREFIX)) {
        const email = token.slice(DEMO_TOKEN_PREFIX.length);
        const demoUser = readDemoUsers()[email];
        if (demoUser) {
          try {
            const syncedUser = await syncDemoUserToBackend(demoUser);
            if (syncedUser?.token) {
              const { token: liveToken, ...userData } = syncedUser;
              storeAuthenticatedUser(userData, liveToken);
              return { success: true, backend: true, user: userData };
            }
          } catch (syncError) {
            if (!isNetworkFailure(syncError)) {
              console.error('Demo account sync failed:', syncError.response?.data?.message || syncError.message);
            }
          }

          const { password: _password, ...userData } = demoUser;
          setUser(userData);
          setIsAuthenticated(true);
          return { success: true, backend: false, user: userData };
        }
      }

      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.data);
      setIsAuthenticated(true);
      return { success: true, backend: true, user: response.data.data };
    } catch (error) {
      logout();
      return { success: false, backend: false, error };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const normalizedEmail = normalizeEmail(email);
      const response = await axios.post(`${API_URL}/auth/login`, { email: normalizedEmail, password });
      const { token, ...userData } = response.data.data;

      storeAuthenticatedUser(userData, token);
      return { success: true };
    } catch (error) {
      if (isNetworkFailure(error)) {
        const users = readDemoUsers();
        const demoUser = users[normalizeEmail(email)];

        if (demoUser?.password === password) {
          const { password: _password, ...userData } = demoUser;
          const token = createDemoToken(userData.email);
          storeAuthenticatedUser(userData, token);
          return { success: true };
        }

        return {
          success: false,
          message: 'Account not found in this browser. Please register first.'
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
        email: normalizeEmail(userData.email)
      };
      const response = await axios.post(`${API_URL}/auth/register`, payload);
      const { token, ...newUser } = response.data.data;

      storeAuthenticatedUser(newUser, token);
      return { success: true };
    } catch (error) {
      if (isNetworkFailure(error)) {
        const users = readDemoUsers();
        const newUser = {
          _id: `demo-${Date.now()}`,
          name: userData.name.trim(),
          email: normalizeEmail(userData.email),
          age: userData.age,
          gender: userData.gender,
          avatar: '',
          preferences: {},
          streak: 0
        };

        users[newUser.email] = {
          ...newUser,
          password: userData.password
        };
        writeDemoUsers(users);

        const token = createDemoToken(newUser.email);
        storeAuthenticatedUser(newUser, token);
        return { success: true };
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
      refreshUser: fetchUser,
      logout, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
