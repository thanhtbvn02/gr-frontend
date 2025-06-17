import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { syncCartAfterLogin, setLoginStatus } from '../../redux/addCart';

const LoginSuccess = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleGoogleLogin = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const isNew = params.get('isNew');
  
      if (token) {
        try {
          localStorage.setItem('accessToken', token);
          console.log('Token đã được lưu vào localStorage');
          
          dispatch(setLoginStatus(true));
          
          await dispatch(syncCartAfterLogin());
          
          login(token);
          
          const decoded = jwtDecode(token);
          localStorage.setItem('userId', decoded.userId);
          localStorage.setItem('userRole', decoded.role);
          if (decoded.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error('Lỗi khi xử lý đăng nhập Google:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };
    
    handleGoogleLogin();
  }, [location.search, login, navigate, dispatch]);

  return <div>Đang xử lý đăng nhập Google...</div>;
};

export default LoginSuccess;
