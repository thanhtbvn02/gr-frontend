import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirm, setShowConfirm] = useState(false); 

  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaImg, setCaptchaImg] = useState('');

  const isRefreshing = useRef(false);

const refreshCaptcha = () => {
  if (isRefreshing.current) return;
  isRefreshing.current = true;

  fetch('http://localhost:5000/api/captcha', {
    credentials: 'include'
  })
    .then(res => res.text())
    .then(setCaptchaImg)
    .catch(() => setCaptchaImg('<p>Không tải được Captcha</p>'))
    .finally(() => {
      setTimeout(() => { isRefreshing.current = false }, 300);
    });
};
  
  useEffect(() => {
    if (!captchaImg) {
      refreshCaptcha();
    }
  }, [captchaImg]);

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert('Bạn cần nhập đầy đủ tài khoản và mật khẩu!');
      return;
    }

    if (password !== confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }

    try {
      const captchaValidRes = await axios.post(
        'http://localhost:5000/api/captcha/verify-captcha',
        { captcha: captchaInput },
        { withCredentials: true }
      );

      if (!captchaValidRes.data.success) {
        alert('Mã xác nhận không đúng!');
        refreshCaptcha();
        return;
      }

      const res = await axios.post('http://localhost:5000/api/users/register', {
        username,
        password,
        email: '',
        full_name: '',
        birth_date: '',
        phone: '',
        address: ''
      });

      if (res.data.message === 'Đăng ký thành công') {
        alert('Đăng ký thành công! Mời bạn đăng nhập.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Lỗi:', err.message || 'Đăng ký thất bại');
    }
  };

  const requirements = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const passedCount = Object.values(requirements).filter(Boolean).length;
  const isPasswordMatched = password === confirmPassword;

  const renderRequirement = (label, isPassed) => (
    <p className={isPassed ? 'passed' : 'not-passed'}>
      <span>{isPassed ? '✓' : '✖'}</span> {label}
    </p>
  );

  return (
    <div className="container">
      <div className="login-box">
        <div className="panel left-panel">
          <h2>Welcome Back!</h2>
          <p>Enter your personal details to use all of site features</p>
          <button onClick={() => navigate('/login')} className="switch-btn">SIGN IN</button>
        </div>
        <div className="form-container">
          <form className="form sign-up-form" onSubmit={handleRegistration}>
            <h2>Create Account</h2>

            <input
              type="text"
              placeholder="Tài khoản"
              className="custom-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <div className="input-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password, ex: Abc@123"
                className="custom-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>

            <div className="password-rules">
              {renderRequirement('At least 6 characters long', requirements.length)}
              {renderRequirement('Upper-case (A-Z)', requirements.uppercase)}
              {renderRequirement('Lower-case (a-z)', requirements.lowercase)}
              {renderRequirement('Numbers (0-9)', requirements.number)}
            </div>

            <div className="input-password-wrapper">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                className="custom-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="toggle-eye"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? '🙈' : '👁️'}
              </span>
            </div>

            {confirmPassword && (
              <p className={isPasswordMatched ? 'passed' : 'not-passed'}>
                <span>{isPasswordMatched ? '✓' : '✖'}</span> {isPasswordMatched ? 'Mật khẩu khớp' : 'Mật khẩu không khớp'}
              </p>
            )}

            <div className="captcha-container">
              <div className="input-group">
                <label>Mã xác nhận</label>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Nhập mã xác nhận"
                  className="custom-input"
                />
              </div>
              <div
                className="captcha-image"
                onClick={refreshCaptcha}
                dangerouslySetInnerHTML={{ __html: captchaImg }}
                style={{ cursor: 'pointer' }}
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={passedCount < 3 || !requirements.length || !isPasswordMatched}
            >
              SIGN UP
            </button>

            <a href="/home" className="skip-login">Skip Register?</a>

            <button
              type="button"
              className="google-login-btn"
              onClick={() => {
                window.location.href = 'http://localhost:5000/api/auth/google';
              }}
            >
              G
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;