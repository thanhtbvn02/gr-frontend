import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SideBar from "../../../components/SideBar/SideBar";
import useUser from "../../../hooks/useUser";
import "./UpdateUser.css";

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const UpdateUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const inputAvatarRef = useRef();

  const [user, setUser] = useState(null);
  const [disableSave, setDisableSave] = useState(true);
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [status, setStatus] = useState("active");

  const { getUserById, updateUser, updateAvatar, deleteUser } = useUser();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserById(id);
        setUser(res);
        setFullName(res.full_name || "");
        setUsername(res.username || "");
        setBirthDate(res.birth_date ? res.birth_date.substring(0, 10) : "");
        setPhone(res.phone || "");
        setEmail(res.email || "");
        setRole(res.role || "user");
        setStatus(res.status || "active");
        setAvatar(res.image || defaultAvatar);
      } catch (err) {
        alert("Không thể lấy thông tin người dùng");
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (!user) return;
    if (
      fullName !== (user.full_name || "") ||
      username !== (user.username || "") ||
      birthDate !== (user.birth_date ? user.birth_date.substring(0, 10) : "") ||
      phone !== (user.phone || "") ||
      email !== (user.email || "") ||
      role !== (user.role || "user") ||
      status !== (user.status || "active")
    ) {
      setDisableSave(false);
    } else {
      setDisableSave(true);
    }
  }, [fullName, username, birthDate, phone, email, role, status, user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      if (file.size > MAX_IMAGE_SIZE) {
        alert("Dung lượng file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.");
        return;
      }
      setAvatarUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await updateAvatar({ id, formData });
        setAvatar(res.url || res.data?.url || defaultAvatar);
        setDisableSave(false);
        alert("Cập nhật ảnh đại diện thành công!");
      } catch (error) {
        alert("Lỗi upload ảnh. Vui lòng thử lại.");
      }
      setAvatarUploading(false);
    } else {
      alert("Định dạng không hỗ trợ. Chỉ nhận .JPEG hoặc .PNG");
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      await deleteUser(id);
      alert("Xóa tài khoản thành công!");
      navigate("/admin/users");
    } catch (err) {
      alert("Có lỗi khi xóa tài khoản.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateUser({
        id,
        data: {
          full_name: fullName,
          username: username,
          birth_date: birthDate,
          phone: phone,
          email: email,
          role: role,
          status: status,
        },
      });
      alert("Cập nhật thông tin thành công!");
      setDisableSave(true);
    } catch (err) {
      alert("Có lỗi khi cập nhật.");
    }
  };

  const maskPhone = (phone) => {
    if (!phone) return "";
    if (phone.length < 4) return phone;
    return "*".repeat(phone.length - 3) + phone.slice(-3);
  };

  if (!user) return <div>Đang tải thông tin...</div>;

  return (
    <div className="add-product-page">
      <div className="sidebar-wrapper">
        <SideBar />
      </div>
      <div className="main-wrapper">
        <div className="info-main-wrap">
          <div className="info-form-left">
            <div className="avatar-block-row">
              <div className="avatar-img-wrap">
                <div className="avatar-title">Ảnh đại diện</div>
                <img className="avatar-circle-img1" src={avatar} alt="Avatar" />
              </div>
              <div className="avatar-info-wrap">
                <button
                  className="update-avatar-btn"
                  onClick={() => inputAvatarRef.current.click()}
                  disabled={avatarUploading}
                >
                  {avatarUploading ? "Đang tải lên..." : "Cập nhật ảnh mới"}
                </button>
                <input
                  ref={inputAvatarRef}
                  type="file"
                  accept=".jpeg,.jpg,.png"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
                <div className="avatar-note">
                  Dung lượng file tối đa 5 MB.
                  <br />
                  Định dạng: .JPEG, .PNG
                </div>
              </div>
            </div>
            <form className="info-form" onSubmit={handleSave}>
              <label>Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Họ và tên"
              />

              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />

              <label>Ngày sinh</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="Ngày sinh"
              />

              <label>Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại"
              />

              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />

              <button type="submit" className="save-btn" disabled={disableSave}>
                Lưu thay đổi
              </button>
              <button className="save-btn" onClick={handleDelete} type="button">
                Xóa tài khoản
              </button>
            </form>
          </div>
          <div className="info-view-right info-view-right-user">
            <div className="role-status-group">
              <div className="toggle-row">
                <label className="toggle-label">Vai trò</label>
                <div className="toggle-switch-group">
                  <label
                    className={`toggle-switch ${
                      role === "user" ? "active" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={role === "admin"}
                      onChange={() =>
                        setRole(role === "admin" ? "user" : "admin")
                      }
                    />
                    <span className="slider" />
                    <span className="toggle-txt">
                      {role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </span>
                  </label>
                </div>
              </div>
              <div className="toggle-row">
                <label className="toggle-label">Trạng thái</label>
                <div className="toggle-switch-group">
                  <label
                    className={`toggle-switch ${
                      status === "active" ? "active" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={status === "active"}
                      onChange={() =>
                        setStatus(status === "active" ? "block" : "active")
                      }
                    />
                    <span className="slider" />
                    <span className="toggle-txt">
                      {status === "active" ? "Kích hoạt" : "Khoá"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUser;
