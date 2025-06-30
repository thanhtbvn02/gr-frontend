import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Block.css";

const Block = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div className="block-bg">
      <div className="block-glass">
        <div className="block-warning-icon">
          <svg viewBox="0 0 64 64" width="90" height="90">
            <circle cx="32" cy="32" r="30" fill="#e53935" stroke="#fff" strokeWidth="4"/>
            <path d="M32 16 v22" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
            <circle cx="32" cy="48" r="3.5" fill="#fff"/>
          </svg>
        </div>
        <h2 className="block-title">Tài khoản của bạn đã bị <span className="block-ban">CẤM</span> sử dụng</h2>
        <p className="block-message">
          Rất tiếc! Tài khoản này đã bị cấm truy cập vào hệ thống.<br/>
          Nếu bạn nghĩ đây là nhầm lẫn, vui lòng liên hệ quản trị viên để được hỗ trợ.
        </p>
        <button className="block-logout-btn" onClick={handleLogout}>
          <span role="img" aria-label="logout">🚪</span> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Block;