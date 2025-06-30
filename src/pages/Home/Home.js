import React, { useState, useEffect } from "react";
import useProduct from "../../hooks/useProduct";
import { Link, useNavigate } from "react-router-dom";
import "./home.css";
import { Header, Footer, ScrollingBar, Slider } from "../../components";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../../redux/addCart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.cart.isLoggedIn);
  const dispatch = useDispatch();

  const [offset, setOffset] = useState(0);
  const [limit] = useState(8);
  const [productList, setProductList] = useState([]);
  const [isEnd, setIsEnd] = useState(false);

  const {
    products = [],
    isLoading,
    isFetching,
  } = useProduct({ offset, limit });

  const slides = [
    "/slider-1.jpg",
    "/slider-2.jpg",
    "/slider-3.jpg",
    "/slider-4.jpg",
    "/slider-5.jpg",
    "/slider-6.jpg",
    "/slider-7.jpg",
    "/slider-8.jpg",
    "/slider-9.jpg"
  ];

  useEffect(() => {
    if (!products || products.length === 0) {
      if (offset > 0) setIsEnd(true);
      return;
    }
    setProductList((prev) =>
      offset === 0 ? products : [...prev, ...products]
    );
  }, [products, offset]);

  const handleAddToCart = (product) => {
    if (!product.id) return;
    if (product.stock === 0) {
      toast.info("Sản phẩm đã hết hàng!");
      return;
    }
    try {
      dispatch(addToCart(product.id, 1));
      toast.success(
        isLoggedIn
          ? "Thêm vào giỏ hàng thành công!"
          : "Sản phẩm đã được thêm vào giỏ hàng tạm thời"
      );
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      if (error.response?.status === 403) {
        navigate("/login");
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      } else {
        toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng!");
      }
    }
  };

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit);
  };

  return (
    <div className="home-main-content" style={{ paddingTop: 90 }}>
      <ToastContainer position="top-right" autoClose={2200} />
      <div>
        <Header />
        <Slider slides={slides} />
      </div>
      <div className="home-container">
        <div className="product-list">
          {productList.map((product) => (
            <div className="product-card" key={product.id}>
              {product.image && <img src={product.image} alt={product.name} />}
              <div className="product-info">
                <h3>
                  <Link to={`/productInfor/${product.id}`}>{product.name}</Link>
                </h3>
                <p className="price">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(product.price)}{" "}
                  / {product.unit}
                </p>
              </div>
              <button
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
                style={
                  product.stock === 0
                    ? {
                        background: "#ccc",
                        color: "#888",
                        cursor: "not-allowed",
                        fontWeight: "bold",
                      }
                    : {}
                }
              >
                {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </button>
            </div>
          ))}
        </div>
        <div className="load-more-container">
          {!isLoading && productList.length > 0 && (
            <button className="load-more-btn" onClick={handleLoadMore}>
              Hiển thị thêm
            </button>
          )}
          {(isLoading || isFetching) && (
            <div className="loading">Đang tải...</div>
          )}
        </div>
      </div>
      <div>
        <ScrollingBar />
        <Footer />
      </div>
    </div>
  );
}
