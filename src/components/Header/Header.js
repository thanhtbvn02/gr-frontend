import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Header.css";
import Category from "./Category";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();
  const [modalInfor, setModalInfor] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Lấy số lượng sản phẩm từ Redux store
  const cartCount = useSelector((state) => state.cart.cartCount || 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const toggleModalInfor = () => {
    setModalInfor(!modalInfor);
  };

  const handleLogout = async () => {
    await axios.post("http://localhost:5000/api/users/logout");
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const userInitial = user?.username?.charAt(4).toUpperCase() || "U";

  return (
    <>
      <header className={`header-main ${isScrolled ? "scrolled" : ""}`}>
        <div className="left-header">
          <Link to="/" className="navbar-brand">
            <img src="/Logo.png" alt="Logo" className="logo" />
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
              {userInitial}
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
      <div></div>
      <Category />

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
