import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { setLoginStatus, syncCartAfterLogin } from '../../redux/addCart';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {login} = useAuth();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalEmail, setModalEmail] = useState(false);
  const [modalCode, setModalCode] = useState(false);

  const toggleModalEmail = () => {
    setModalEmail(!modalEmail);
  }

  const toggleModalCode = () => {
    setModalCode(!modalCode);
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Bạn cần nhập đầy đủ tài khoản và mật khẩu!');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axiosInstance.post('/users/login', {
        username,
        password
      });
      
      // Giải mã token để lấy thông tin user
      const decodedToken = jwtDecode(res.data.token);
      console.log('Decoded token:', decodedToken);
      
      // Lưu token trước để đảm bảo API cart có thể xác thực
      localStorage.setItem('accessToken', res.data.token);
      
      // Đồng bộ giỏ hàng từ localStorage lên server
      await dispatch(syncCartAfterLogin());
      
      // Lưu thông tin người dùng và cập nhật trạng thái đăng nhập
      login(res.data.token);
      dispatch(setLoginStatus(true));
      
      // Lưu userId (nếu cần)
      localStorage.setItem('userId', res.data.user.id);

      // Chuyển hướng sau khi đăng nhập thành công
      navigate(location.state?.from || '/');
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      alert('Bạn cần nhập email!');
      return;
    }
    try {
      const res = await axiosInstance.post('/users/forgot-password', {
        email
      });
      alert('Email đã được gửi đến email của bạn!');
      setModalEmail(false);
      setModalCode(true);
    } catch (err) {
      console.error('Forgot password error:', err);
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code) {
      alert('Bạn cần nhập mã xác nhận và mật khẩu mới!');
      return;
    }
    try {
      const res = await axiosInstance.post('/users/reset-password', {
        code
      });
      alert('Mật khẩu đã được đặt lại!');
      setModalCode(false);
    } catch (err) {
      console.error('Reset password error:', err);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      login(token);
      navigate('/');
    }
  }, [location.search, login, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = 'https://gr-backend.onrender.com/api/auth/google';
  };

  return (
    <div className="container">
      <div className="login-box">
        <div className="panel left-panel">
          <h2>Hello, Friend!</h2>
          <p>Register with your personal details to use all of site features</p>
          <button onClick={() => navigate('/register')} className="switch-btn">SIGN UP</button>
        </div>
        <div className="form-container">
        <form onSubmit={handleLogin} className="form sign-in-form">
            <h2>Sign In</h2>
            <input
                type="text"
                placeholder="Tài khoản"
                className="custom-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Mật khẩu"
                className="custom-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <a onClick={toggleModalEmail} className="link">Forgot Your Password?</a>
            <button type="submit" className="submit-btn">SIGN IN</button>
            <a href="/home" className="skip-login">Skip Login?</a>
            <button type="button" onClick={handleGoogleLogin} className="google-btn">
              Đăng nhập bằng Google
            </button>
            </form>

        </div>
      </div>
      {modalEmail && (
        <div className="modalEmail">
          <div className="overlayLogin" onClick={toggleModalEmail}></div>
          <div className="modalEmail-content">
            <h2>Please enter your email</h2>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="custom-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button type="button" className="submit-btn" onClick={handleForgotPassword}>Send</button>
          </div>
        </div>
      )}
      {modalCode && (
        <div className="modalCode">
          <div className="overlayLogin" onClick={toggleModalCode}></div>
          <div className="modalCode-content">
            <h2>Enter the code from your email</h2>
            <input
              type="text"
              placeholder="Mã OTP"
              className="custom-input"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
            <button type="button" className="submit-btn" onClick={handleResetPassword}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
