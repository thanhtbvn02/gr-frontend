import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const useAuth = () => {
    const [user, setUser] = useState(null);
  
    // Load token on mount
    useEffect(() => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const { userId, exp } = jwtDecode(token);
        if (Date.now() < exp * 1000) {
          setUser({ token, userId });
        } else {
          localStorage.removeItem('accessToken');
        }
      }
    }, []);
  
    const login = (token) => {
      localStorage.setItem('accessToken', token);
      const { userId } = jwtDecode(token);
      setUser({ token, userId });
    };
  
    const logout = () => {
      localStorage.removeItem('accessToken');
      setUser(null);
    };
  
    return {
      user,
      isLoggedIn: !!user,
      login,
      logout,
    };
  };