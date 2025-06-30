import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setLoginStatus, syncCartAfterLogin } from "../../redux/addCart";
import useUser from "../../hooks/useUser";
import { useAuth } from "../../hooks/useAuth";
import { LuEye, LuEyeClosed } from "react-icons/lu";
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const onSubmit = async (data) => {
    try {
      const res = await loginUser({
        username: data.username,
        password: data.password,
      });

      if (res.user.status === "block") {
        toast.error("Tài khoản của bạn đã bị khoá.");
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

  return (
    <div className="container">
      <div className="login-box">
        <div className="panel left-panel">
          <h2>Chào mừng tới Hust Drug Store</h2>
          <p>
            Nhập thông tin cá nhân của bạn để sử dụng tất cả các tính năng của
            trang web
          </p>
          <button onClick={() => navigate("/register")} className="switch-btn">
            ĐĂNG KÝ
          </button>
        </div>
        <div className="form-container">
          <form onSubmit={handleSubmit(onSubmit)} className="form sign-in-form">
            <h2>Đăng nhập</h2>
            <input
              type="text"
              placeholder="Tên tài khoản"
              className="custom-input"
              {...register("username")}
            />
            {errors.username && (
              <p className="not-passed">{errors.username.message}</p>
            )}
            <div
              className="input-password-wrapper"
              style={{ position: "relative" }}
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu, ví dụ: Abc@123"
                className="custom-input"
                {...register("password")}
              />
              <span
                className="toggle-eye"
                style={{
                  position: "absolute",
                  right: 15,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={0}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Xem mật khẩu"}
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
            <a href="/" className="skip-login">
              Bỏ qua đăng nhập?
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
      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
};

export default Login;
