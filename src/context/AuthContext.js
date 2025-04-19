import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom'; // Add useLocation
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isUserUpdated, setIsUserUpdated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Add useLocation to get current route

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // Define public routes that don't require authentication
    const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

    if (storedToken && userId && !isUserUpdated) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        .then((res) => {
          setUser(res.data);
          setToken(storedToken);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Auth check error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setUser(null);
          setToken(null);
          setLoading(false);
          toast.error('Session expired. Please log in again.');
          // Only redirect to /login if not on a public route
          if (!publicRoutes.includes(location.pathname)) {
            navigate('/login');
          }
        });
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setUser(null);
      setToken(null);
      setLoading(false);
      // Only redirect to /login if not on a public route
      if (!publicRoutes.includes(location.pathname)) {
        navigate('/login');
      }
    }
  }, [navigate, isUserUpdated, location.pathname]); // Add location.pathname to dependencies

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user.id);
      console.log('User after login:', res.data.user);
      setUser(res.data.user);
      setToken(res.data.token);
      setIsUserUpdated(false);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    setToken(null);
    setIsUserUpdated(false);
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const updateUser = (updatedUser) => {
    console.log('Updating user in AuthContext:', updatedUser);
    setUser(updatedUser);
    setIsUserUpdated(true);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};