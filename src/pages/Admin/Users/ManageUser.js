import React, { useState } from "react";
import SideBar from "../../../components/SideBar/SideBar";
import { useNavigate } from "react-router-dom";
import "./ManageUser.css";
import {
  MdOutlinePersonAddAlt,
  MdOutlineSearch,
  MdClear,
  MdDelete,
} from "react-icons/md";
import useUser from "../../../hooks/useUser";

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

function ManageUser() {
  const navigate = useNavigate();
  const { users, isLoading, refetch, keyword, setKeyword, deleteUsers } =
    useUser();

  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSearch = () => refetch();
  const handleReset = () => {
    setKeyword("");
    refetch();
  };

  const handleSelectAll = (checked) => {
    if (checked) setSelectedUsers(users.map((u) => u.id));
    else setSelectedUsers([]);
  };
  const handleSelectUser = (id, checked) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)
    );
  };

  const handleDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa các tài khoản đã chọn?"))
      return;
    try {
      await deleteUsers(selectedUsers);
      alert("Xóa tài khoản thành công!");
      setSelectedUsers([]);
      refetch();
    } catch (err) {
      alert("Có lỗi khi xóa tài khoản.");
    }
  };

  function renderStatus(status) {
    if (!status) return <span className="badge badge-other">Chưa rõ</span>;
    if (status === "active")
      return <span className="badge badge-active">Đang hoạt động</span>;
    if (status === "block")
      return <span className="badge badge-banned">Bị khoá</span>;
    return <span className="badge badge-other">{status}</span>;
  }

  return (
    <div className="admin-container">
      <div className="sidebar-wrapper">
        <SideBar />
      </div>
      <div className="main-wrapper">
        <div className="user-toolbar">
          <button
            className="add-user-btn"
            onClick={() => navigate("/admin/users/add")}
          >
            <MdOutlinePersonAddAlt style={{ marginRight: 7, fontSize: 20 }} />
            Thêm người mới
          </button>
          <div className="user-search-bar">
            <input
              type="text"
              className="user-search-input"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {keyword && (
              <button className="btn-clear" onClick={handleReset}>
                <MdClear />
              </button>
            )}
            <button className="btn-search" onClick={handleSearch}>
              <MdOutlineSearch />
            </button>
          </div>
          <button
            className="btn-delete"
            onClick={handleDelete}
            disabled={selectedUsers.length === 0}
          >
            <MdDelete />
          </button>
        </div>
        <table className="user-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>Ảnh</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
              <th>Ngày sinh</th>
              <th>Giới tính</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: "36px 0",
                    color: "#999",
                  }}
                >
                  Đang tải...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: "32px 0",
                    color: "#888",
                  }}
                >
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={`user-row${
                    selectedUsers.includes(user.id) ? " selected" : ""
                  }`}
                  onClick={() => navigate(`/admin/users/update/${user.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) =>
                        handleSelectUser(user.id, e.target.checked)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td>
                    {user.image || defaultAvatar ? (
                      <img
                        src={user.image || defaultAvatar}
                        alt={user.full_name}
                        className="user-avatar"
                      />
                    ) : (
                      <div className="user-avatar user-avatar-placeholder" />
                    )}
                  </td>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.address}</td>
                  <td>{user.birth_date}</td>
                  <td>{user.gender}</td>
                  <td>{renderStatus(user.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageUser;
