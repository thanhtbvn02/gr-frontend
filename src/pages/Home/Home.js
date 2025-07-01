import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./home.css";
import { Header, Footer, ScrollingBar, Slider } from "../../components";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../../redux/addCart";
import { ToastContainer, toast } from "react-toastify";
import useProduct from "../../hooks/useProduct";
import "react-toastify/dist/ReactToastify.css";

const CATEGORIES = [
  { id: 55, title: "Cải thiện sắc đẹp" },
  { id: 130, title: "Đồ sơ cứu cần thiết" },
  { id: 160, title: "Thuốc chữa bệnh" },
];

const LIMIT = 10;

function ProductSection({ categoryId, title }) {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.cart.isLoggedIn);

  const [offset, setOffset] = useState(0);
  const [productList, setProductList] = useState([]);
  const [isEnd, setIsEnd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { fetchProductsByCategory } = useProduct();

  // Hàm load ảnh cho từng sản phẩm
  const attachImages = async (productList) => {
    return await Promise.all(
      productList.map(async (product) => {
        try {
          const imgRes = await fetch(
            `http://localhost:5000/api/images?product_id=${product.id}`
          );
          const data = await imgRes.json();
          const firstImage = data?.[0]?.url || null;
          return { ...product, image: firstImage };
        } catch {
          return { ...product, image: null };
        }
      })
    );
  };

  const fetchProducts = async (newOffset = 0, append = false) => {
    setIsLoading(true);
    try {
      const res = await fetchProductsByCategory({
        categoryId,
        offset: newOffset,
        limit: LIMIT,
      });
      const withImages = await attachImages(res);

      if (withImages.length < LIMIT) setIsEnd(true);
      setProductList((prev) =>
        append ? [...prev, ...withImages] : withImages
      );
    } catch {
      toast.error("Lỗi khi tải sản phẩm.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setOffset(0);
    setIsEnd(false);
    fetchProducts(0, false);
    // eslint-disable-next-line
  }, [categoryId]);

  const handleLoadMore = () => {
    const nextOffset = offset + LIMIT;
    setOffset(nextOffset);
    fetchProducts(nextOffset, true);
  };

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
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng!");
    }
  };

  return (
    <div className="product-section">
      <h2 style={{ margin: "32px 0 16px", fontWeight: 700, textAlign: "left" }}>
        {title}
      </h2>
      <div className="product-list five-per-row">
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
        {!isLoading && productList.length > 0 && !isEnd && (
          <button className="load-more-btn" onClick={handleLoadMore}>
            Hiển thị thêm
          </button>
        )}
        {isLoading && <div className="loading">Đang tải...</div>}
      </div>
    </div>
  );
}

export default function Home() {
  const slides = [
    "/slider-1.jpg",
    "/slider-2.jpg",
    "/slider-3.jpg",
    "/slider-4.jpg",
    "/slider-5.jpg",
    "/slider-6.jpg",
    "/slider-7.jpg",
    "/slider-8.jpg",
    "/slider-9.jpg",
  ];

  return (
    <div className="home-main-content" style={{ paddingTop: 90 }}>
      <ToastContainer position="top-right" autoClose={2200} />
      <Header />
      <Slider slides={slides} />
      <div className="home-container">
        {CATEGORIES.map((cat) => (
          <ProductSection key={cat.id} categoryId={cat.id} title={cat.title} />
        ))}
      </div>
      <ScrollingBar />
      <Footer />
    </div>
  );
}
