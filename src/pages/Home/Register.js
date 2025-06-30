import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import useUser from "../../hooks/useUser";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";

const schema = Yup.object().shape({
  username: Yup.string()
    .required("Tài khoản là bắt buộc")
    .matches(
      /^[a-zA-Z0-9]+$/,
      "Chỉ được nhập chữ, số, không dấu và không khoảng trắng"
    ),
  password: Yup.string()
    .required("Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu tối thiểu 6 ký tự")
    .matches(/[A-Z]/, "Cần có chữ in hoa (A-Z)")
    .matches(/[a-z]/, "Cần có chữ thường (a-z)")
    .matches(/[0-9]/, "Cần có số (0-9)"),
  confirmPassword: Yup.string()
    .required("Nhập lại mật khẩu!")
    .oneOf([Yup.ref("password")], "Mật khẩu không khớp"),
});

const Register = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const { registerUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
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
      const res = await registerUser({
        username: data.username,
        password: data.password,
        captchaToken,
      });
      if (res.message === "Đăng ký thành công") {
        toast.success("Đăng ký thành công! Mời bạn đăng nhập.");
        setTimeout(() => {
          navigate("/login");
        }, 1200);
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      toast.error("Đăng ký thất bại: " + errorMessage);
      recaptchaRef.current.reset();
      setCaptchaToken(null);
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <div className="panel left-panel">
          <h2>Chào mừng tới Hust Drug Store</h2>
          <p>
            Nhập thông tin cá nhân của bạn để sử dụng tất cả các tính năng của
            trang web
          </p>
          <button onClick={() => navigate("/login")} className="switch-btn">
            ĐĂNG NHẬP
          </button>
        </div>
        <div className="form-container">
          <form className="form sign-up-form" onSubmit={handleSubmit(onSubmit)}>
            <h2>Tạo tài khoản</h2>

            <input
              type="text"
              placeholder="Tên tài khoản"
              className="custom-input"
              {...register("username")}
            />
            {errors.username && (
              <p className="not-passed">{errors.username.message}</p>
            )}

            <div className="input-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu, ví dụ: Abc@123"
                className="custom-input"
                {...register("password")}
              />
              <span
                className="toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <LuEye /> : <LuEyeClosed />}
              </span>
            </div>
            {errors.password && (
              <p className="not-passed">{errors.password.message}</p>
            )}

            <div className="input-password-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                className="custom-input"
                {...register("confirmPassword")}
              />
              <span
                className="toggle-eye"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <LuEye /> : <LuEyeClosed />}
              </span>
            </div>
            {errors.confirmPassword && (
              <p className="not-passed">{errors.confirmPassword.message}</p>
            )}

            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.REACT_APP_SITE_KEY}
              onChange={(token) => setCaptchaToken(token)}
            />

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              ĐĂNG KÝ
            </button>
            <a href="/home" className="skip-login">
              Bỏ qua đăng ký?
            </a>
            <button
              type="button"
              className="google-login-btn"
              onClick={() => {
                window.location.href = "http://localhost:5000/api/auth/google";
              }}
            >
              ĐĂNG NHẬP VỚI GOOGLE
            </button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default Register;
