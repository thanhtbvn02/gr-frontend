import React from "react";
import { useNavigate } from "react-router-dom";
import "./SideBar.css";
import { MdSell, MdLogout } from "react-icons/md";
import { FaProductHunt, FaRegUser } from "react-icons/fa";  
import { useAuth } from "../../hooks/useAuth";
import useUser from "../../hooks/useUser";

export default function SideBar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { logoutUser } = useUser();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logoutUser();
    logout();
    navigate("/login");
  };

  return (
    <nav className="sidebar-nav">
      <div className="sidebar-logo" onClick={() => handleNavigate("/admin")}>
        DRUG STORE
      </div>
      <div className="nav-link" onClick={() => handleNavigate("/admin/users")}>
        <FaRegUser />
        Manage Users
      </div>
      <div
        className="nav-link"
        onClick={() => handleNavigate("/admin/products")}
      >
        <FaProductHunt />
        Manage Products
      </div>
      <div className="nav-link" onClick={() => handleNavigate("/admin/orders")}>
        <MdSell />
        Manage Orders
      </div>

      <div className="sidebar-footer">
        <div className="nav-link" onClick={handleLogout}>
          <MdLogout />
          Logout
        </div>
      </div>
    </nav>
  );
}
