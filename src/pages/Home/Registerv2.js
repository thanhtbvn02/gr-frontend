import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import "./Register.css";
import useUser from "../../hooks/useUser";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();

  const recaptchaRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { registerUser } = useUser();
  const [captchaToken, setCaptchaToken] = useState(null);

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword) {
      toast.error("Bạn cần nhập đầy đủ tài khoản và mật khẩu!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }
    if (!captchaToken) {
      toast.error("Vui lòng xác nhận bạn không phải robot!");
      return;
    }

    try {
      const token = recaptchaRef.current.getValue();

      if (!token) {
        toast.error("Vui lòng xác nhận bạn không phải robot!");
        return;
      }

      const verifyRes = await axios.post(
        "http://localhost:5000/api/captcha/verify-captcha",
        { token: captchaToken }
      );
      if (!verifyRes.data.success) {
        toast.error("Captcha không hợp lệ");
        recaptchaRef.current.reset();
        setCaptchaToken(null);
        return;
      }

      const res = await registerUser({ username, password, captchaToken });

      if (res.message === "Đăng ký thành công") {
        toast.success("Đăng ký thành công! Mời bạn đăng nhập.");
        navigate("/login");
      }
    } catch (err) {
      console.error(
        "Registration error:",
        err,
        err?.response,
        err?.response?.data
      );
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      toast.error("Đăng ký thất bại: " + errorMessage);
      recaptchaRef.current.reset();
      setCaptchaToken(null);
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
    <p className={isPassed ? "passed" : "not-passed"}>
      <span>{isPassed ? "✓" : "✖"}</span> {label}
    </p>
  );

  return (
    <div className="container">
      <div className="login-box">
        <div className="panel left-panel">
          <h2>Welcome Back!</h2>
          <p>Enter your personal details to use all of site features</p>
          <button onClick={() => navigate("/login")} className="switch-btn">
            SIGN IN
          </button>
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
                type={showPassword ? "text" : "password"}
                placeholder="Password, ex: Abc@123"
                className="custom-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <div className="password-rules">
              {renderRequirement(
                "At least 6 characters long",
                requirements.length
              )}
              {renderRequirement("Upper-case (A-Z)", requirements.uppercase)}
              {renderRequirement("Lower-case (a-z)", requirements.lowercase)}
              {renderRequirement("Numbers (0-9)", requirements.number)}
            </div>

            <div className="input-password-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                className="custom-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className="toggle-eye"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "🙈" : "👁️"}
              </span>
            </div>

            {confirmPassword && (
              <p className={isPasswordMatched ? "passed" : "not-passed"}>
                <span>{isPasswordMatched ? "✓" : "✖"}</span>{" "}
                {isPasswordMatched ? "Mật khẩu khớp" : "Mật khẩu không khớp"}
              </p>
            )}

            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.REACT_APP_SITE_KEY}
              onChange={(token) => setCaptchaToken(token)}
            />

            <button
              type="submit"
              className="submit-btn"
              disabled={
                passedCount < 4 || !requirements.length || !isPasswordMatched
              }
            >
              SIGN UP
            </button>

            <a href="/home" className="skip-login">
              Skip Register?
            </a>

            <button
              type="button"
              className="google-login-btn"
              onClick={() => {
                window.location.href = "http://localhost:5000/api/auth/google";
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
