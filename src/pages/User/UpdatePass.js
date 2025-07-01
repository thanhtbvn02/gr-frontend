import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./UpdatePass.css";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import useUser from "../../hooks/useUser";
import { toast } from "react-toastify";

const UpdatePass = () => {
  const { id } = useParams();
  const { changePassword } = useUser();
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [loading, setLoading] = useState(false);

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (
      !passwordData.oldPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Vui lòng nhập đầy đủ các trường.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp.");
      return;
    }
    setLoading(true);
    try {
      await changePassword({
        id,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu."
      );
    }
    setLoading(false);
  };

  return (
    <div className="update-pass-wrap">
      <h2>Đổi mật khẩu</h2>
      <form className="update-pass-form" onSubmit={handleChangePassword}>
        <div className="update-pass-form-item">
          <label>Mật khẩu cũ</label>
          <div className="inputWithIcon">
            <input
              type={showPassword.oldPassword ? "text" : "password"}
              name="oldPassword"
              placeholder="Mật khẩu cũ"
              value={passwordData.oldPassword}
              onChange={handlePasswordInputChange}
            />
            <span
              className="toggle-icon"
              onClick={() => toggleShowPassword("oldPassword")}
            >
              {showPassword.oldPassword ? <LuEye /> : <LuEyeClosed />}
            </span>
          </div>
        </div>

        <div className="update-pass-form-item">
          <label>Mật khẩu mới</label>
          <div className="inputWithIcon">
            <input
              type={showPassword.newPassword ? "text" : "password"}
              name="newPassword"
              placeholder="Mật khẩu mới"
              value={passwordData.newPassword}
              onChange={handlePasswordInputChange}
            />
            <span
              className="toggle-icon"
              onClick={() => toggleShowPassword("newPassword")}
            >
              {showPassword.newPassword ? <LuEye /> : <LuEyeClosed />}
            </span>
          </div>
        </div>

        <div className="update-pass-form-item">
          <label>Xác nhận mật khẩu mới</label>
          <div className="inputWithIcon">
            <input
              type={showPassword.confirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu mới"
              value={passwordData.confirmPassword}
              onChange={handlePasswordInputChange}
            />
            <span
              className="toggle-icon"
              onClick={() => toggleShowPassword("confirmPassword")}
            >
              {showPassword.confirmPassword ? <LuEye /> : <LuEyeClosed />}
            </span>
          </div>
        </div>
        <button className="update-pass-btn" type="submit" disabled={loading}>
          {loading ? "Đang đổi..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
};

export default UpdatePass;
