import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { setLoginStatus, syncCartAfterLogin } from "../../redux/addCart";
import useUser from "../../hooks/useUser";
import { useAuth } from "../../hooks/useAuth";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import { FaClinicMedical } from "react-icons/fa";
import axiosInstance from "../../utils/axiosConfig";
import "./Login.css";

const schema = Yup.object().shape({
  username: Yup.string()
    .required("Tài khoản là bắt buộc")
    .matches(
      /^[a-zA-Z0-9]+$/,
      "Chỉ được nhập chữ, số, không dấu và không khoảng trắng"
    ),
  password: Yup.string().required("Bạn cần nhập mật khẩu!"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loginUser } = useUser();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [modalEmail, setModalEmail] = useState(false);
  const [modalCode, setModalCode] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoadingForgot, setIsLoadingForgot] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await loginUser({
        username: data.username,
        password: data.password,
      });

      if (res.user.status === "block" || res.user.status === "blocked") {
        toast.error("Tài khoản của bạn đã bị cấm.");
        setTimeout(() => {
          navigate("/block");
        }, 1000);
        return;
      }

      localStorage.setItem("accessToken", res.token);
      await dispatch(syncCartAfterLogin());
      login(res.token);
      dispatch(setLoginStatus(true));
      localStorage.setItem("userId", res.user.id);
      localStorage.setItem("userRole", res.user.role);
      localStorage.setItem("userStatus", res.user.status);

      toast.success("Đăng nhập thành công!");
      setTimeout(() => {
        if (res.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate(location.state?.from || "/");
        }
      }, 1200);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const toggleModalEmail = () => {
    setModalEmail(!modalEmail);
    setEmail("");
    setCode("");
  };

  const toggleModalCode = () => setModalCode(!modalCode);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Bạn cần nhập email!");
      return;
    }
    setIsLoadingForgot(true);
    try {
      await axiosInstance.post("/users/forgot-password", { email });
      toast.success("Đã gửi mã xác nhận tới email của bạn!");
      setModalEmail(false);
      setModalCode(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không gửi được email, vui lòng thử lại!"
      );
    }
    setIsLoadingForgot(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code) {
      toast.error("Bạn cần nhập mã xác nhận!");
      return;
    }
    setIsLoadingForgot(true);
    try {
      await axiosInstance.post("/users/reset-password", { code });
      toast.success(
        "Mã xác nhận hợp lệ! Bạn có thể đặt lại mật khẩu mới ở email."
      );
      setModalCode(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Mã xác nhận không đúng hoặc đã hết hạn!"
      );
    }
    setIsLoadingForgot(false);
  };

  return (
    <div className="auth-bg">
      <div className="auth-box">
        <div className="auth-aside">
          <FaClinicMedical size={62} className="pharmacy-icon" />
          <h2>
            Chào mừng đến <br />{" "}
            <span className="store-brand">Hust Drugstore</span>
          </h2>
          <p>
            Đăng nhập để mua thuốc, tư vấn sức khoẻ và nhận ưu đãi hấp dẫn từ hệ
            thống nhà thuốc hiện đại.
          </p>
          <button onClick={() => navigate("/register")} className="switch-btn">
            ĐĂNG KÝ NGAY
          </button>
        </div>
        <div className="form-container">
          <form onSubmit={handleSubmit(onSubmit)} className="form sign-in-form">
            <h2>Đăng nhập tài khoản</h2>
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
                autoComplete="current-password"
              />
              <span
                className="toggle-eye"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <LuEye /> : <LuEyeClosed />}
              </span>
            </div>
            {errors.password && (
              <p className="not-passed">{errors.password.message}</p>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              ĐĂNG NHẬP
            </button>

            <a
              onClick={toggleModalEmail}
              className="skip-login"
              style={{ cursor: "pointer" }}
            >
              Quên mật khẩu?
            </a>
            <a href="/" className="skip-login">
              Vào trang chủ mà không cần đăng nhập
            </a>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="google-btn"
            >
              ĐĂNG NHẬP VỚI GOOGLE
            </button>
          </form>
        </div>
      </div>

      {modalEmail && (
        <>
          <div className="overlayLogin" onClick={toggleModalEmail}></div>
          <div className="modalEmail-content">
            <h2>Nhập email để lấy mã xác nhận</h2>
            <input
              type="email"
              placeholder="Email đăng ký"
              className="custom-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="button"
              className="submit-btn"
              onClick={handleForgotPassword}
              disabled={isLoadingForgot}
            >
              Gửi mã xác nhận
            </button>
          </div>
        </>
      )}

      {modalCode && (
        <>
          <div
            className="overlayLogin"
            onClick={() => setModalCode(false)}
          ></div>
          <div className="modalCode-content">
            <h2>Nhập mã xác nhận đã gửi tới email</h2>
            <input
              type="text"
              placeholder="Mã xác nhận từ email"
              className="custom-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="button"
              className="submit-btn"
              onClick={handleVerifyCode}
              disabled={isLoadingForgot}
            >
              Xác nhận
            </button>
          </div>
        </>
      )}

      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
};

export default Login;
