import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const isRefreshing = useRef(false);
  const [captchaImg, setCaptchaImg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      captchaInput: ''
    }
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const refreshCaptcha = () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;

    fetch('http://localhost:5000/api/captcha', {
      credentials: 'include'
    })
      .then(res => res.text())
      .then(setCaptchaImg)
      .catch(() => setCaptchaImg('<p>Không tải được Captcha</p>'))
      .finally(() => setTimeout(() => (isRefreshing.current = false), 300));
  };

  useEffect(() => {
    if (!captchaImg) refreshCaptcha();
  }, [captchaImg]);

  const requirements = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password)
  };
  const passedCount = Object.values(requirements).filter(Boolean).length;
  const isPasswordMatched = password === confirmPassword;

  const onSubmit = async (data) => {
    const { username, password, captchaInput } = data;

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
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

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
          <form className="form sign-up-form" onSubmit={handleSubmit(onSubmit)}>
            <h2>Create Account</h2>

            <input
              placeholder="Tài khoản"
              className="custom-input"
              {...register('username', { required: 'Tài khoản là bắt buộc' })}
            />
            {errors.username && <p className="error">{errors.username.message}</p>}

            <div className="input-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password, ex: Abc@123"
                className="custom-input"
                {...register('password', { required: 'Mật khẩu là bắt buộc' })}
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
                {...register('confirmPassword', {
                  required: 'Xác nhận mật khẩu là bắt buộc',
                  validate: value => value === password || 'Mật khẩu không khớp'
                })}
              />
              <span
                className="toggle-eye"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? '🙈' : '👁️'}
              </span>
            </div>
            {errors.confirmPassword && (
              <p className="error">{errors.confirmPassword.message}</p>
            )}

            <div className="captcha-container">
              <div className="input-group">
                <label>Mã xác nhận</label>
                <input
                  type="text"
                  className="custom-input"
                  {...register('captchaInput', { required: 'Vui lòng nhập mã captcha' })}
                />
                {errors.captchaInput && (
                  <p className="error">{errors.captchaInput.message}</p>
                )}
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
