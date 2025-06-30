import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useUser from "../../hooks/useUser";
import "./Header.css";
import Category from "./Category";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();
  const [modalInfor, setModalInfor] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(defaultAvatar);
  const cartCount = useSelector((state) => state.cart.cartCount || 0);
  const { getUserById, logoutUser } = useUser();

  const searchSchema = Yup.object().shape({
    searchTerm: Yup.string()
      .min(2, "Nhập ít nhất 2 ký tự để tìm kiếm")
      .required("Không được để trống ô tìm kiếm"),
  });

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      await searchSchema.validate({ searchTerm });
      if (searchTerm.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        toast.success("Tìm kiếm thành công!");
      }
    } catch (err) {
      toast.error(err.message || "Lỗi tìm kiếm!");
    }
  };

  const toggleModalInfor = () => {
    setModalInfor(!modalInfor);
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    const fetchUser = async () => {
      try {
        const res = await getUserById(userId);
        setAvatar(res.image || defaultAvatar);
      } catch (err) {
        toast.error("Không thể lấy thông tin người dùng!");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      toast.success("Đăng xuất thành công!");
      navigate("/login");
    } catch {
      toast.error("Có lỗi khi đăng xuất!");
    }
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <header className={`header-main ${isScrolled ? "scrolled" : ""}`}>
        <div className="left-header">
          <Link to="/" className="navbar-brand">
            <img src="/cfimages.png" alt="Logo" className="logo" />
            <p>Drug Hust</p>
          </Link>
        </div>

        <div className="center-search">
          <form className="search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-button">
              <img
                src="https://cdn-icons-png.flaticon.com/128/3031/3031293.png"
                alt="Search"
                className="search-icon"
              />
            </button>
          </form>
        </div>

        <nav className="right-header">
          <Link to="/cart" className="cart-link">
            <img
              src="https://onthisinhvien.com/images/icon/otsv/cart.svg"
              alt="Cart"
              className="cart-icon"
            />
            {cartCount > 0 ? (
              <div className="output-cart" id="output">
                {cartCount}
              </div>
            ) : (
              <div></div>
            )}
          </Link>

          {isLoggedIn ? (
            <div className="user-icon" onClick={toggleModalInfor}>
              <img src={avatar} alt="Avatar" className="avatar-icon" />
            </div>
          ) : (
            <>
              <Link to="/login" className="auth-link login-link">
                Đăng nhập
              </Link>
              <Link to="/register" className="auth-link register-link">
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </header>
      <div className="category-bar-sticky">
        <Category />
      </div>

      {modalInfor && (
        <div className="modalInfor">
          <div className="overlayLogin" onClick={toggleModalInfor} />
          <div className="dropdown">
            <Link
              to={`/account/${user.userId}`}
              state={{ tab: "info" }}
              className="dropdown-item info-link"
            >
              Thông tin
            </Link>
            <Link
              to={`/account/${user.userId}`}
              state={{ tab: "address" }}
              className="dropdown-item info-link"
            >
              Sổ địa chỉ
            </Link>
            <Link
              to={`/account/${user.userId}`}
              state={{ tab: "order" }}
              className="dropdown-item info-link"
            >
              Đơn hàng
            </Link>
            <button
              type="button"
              className="dropdown-item logout-button"
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
