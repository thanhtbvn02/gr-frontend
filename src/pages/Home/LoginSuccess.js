
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';

const LoginSuccess = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const isNew = params.get('isNew');

    if (token) {
      login(token);
      const userId = jwtDecode(token).userId;
      localStorage.setItem('userId', userId);
      navigate('/home');
    } else {
      navigate('/login');
    }
  }, [location.search]);

  return <div>Đang xử lý đăng nhập Google...</div>;
};

export default LoginSuccess;
