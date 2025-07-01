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
import { FaClinicMedical } from "react-icons/fa";
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
    <div className="auth-bg">
      <div className="auth-box">
        <div className="auth-aside">
          <FaClinicMedical size={62} className="pharmacy-icon" />
          <h2>Đăng ký <br /><span className="store-brand">Hust Drugstore</span></h2>
          <p>
            Đăng ký tài khoản để quản lý đơn thuốc, nhận ưu đãi và chăm sóc sức khoẻ chủ động cùng chúng tôi.
          </p>
          <button onClick={() => navigate("/login")} className="switch-btn">
            ĐÃ CÓ TÀI KHOẢN
          </button>
        </div>
        <div className="form-container">
          <form className="form sign-up-form" onSubmit={handleSubmit(onSubmit)}>
            <h2>Tạo tài khoản mới</h2>

            <input
              type="text"
              placeholder="Tên tài khoản"
              className="custom-input"
              {...register("username")}
              autoComplete="username"
            />
            {errors.username && (
              <p className="not-passed">{errors.username.message}</p>
            )}

            <div className="input-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                className="custom-input"
                {...register("password")}
                autoComplete="new-password"
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
                autoComplete="new-password"
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

            <div className="recaptcha-container">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.REACT_APP_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
              />
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              ĐĂNG KÝ
            </button>
            <a href="/" className="skip-login">
              Về trang chủ mà không đăng ký
            </a>
            <button
              type="button"
              className="google-btn"
              onClick={() => {
                window.location.href = "http://localhost:5000/api/auth/google";
              }}
            >
              ĐĂNG KÝ BẰNG GOOGLE
            </button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default Register;
