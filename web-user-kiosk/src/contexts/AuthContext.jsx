import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('webUser');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      // Optional: verify token with backend
      fetch('http://localhost:8000/api/user', {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Invalid token');
          return res.json();
        })
        .then(data => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('webUser');
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email, password: '***' });
      
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response data:', data);
      
      if (!response.ok) {
        throw new Error(data?.message || 'Invalid email or password');
      }
      
      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem('webUser', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const signup = async (userData) => {
    try {
      console.log('Attempting signup with:', { ...userData, password: '***', confirmPassword: '***' });
      
      const response = await fetch('http://localhost:8000/api/register/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      console.log('Signup response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Signup error data:', errorData);
        if (errorData?.errors) {
          throw new Error(
            Object.values(errorData.errors).flat().join(' ')
          );
        }
        throw new Error(errorData?.message || 'Registration failed');
      }
      
      const successData = await response.json();
      console.log('Signup success data:', successData);
      return true;
    } catch (err) {
      console.error('Signup error:', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('webUser');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 