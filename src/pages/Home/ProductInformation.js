import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./ProductInformation.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../../redux/addCart";
import { MdOutlineZoomIn, MdOutlineZoomOut } from "react-icons/md";

const MAX_CONTENT_HEIGHT = 500;

const ProductInformation = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [details, setDetails] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  const [showMoreAll, setShowMoreAll] = useState(false);
  const [contentOverflow, setContentOverflow] = useState(false);

  const descriptionRef = useRef(null);
  const ingredientRef = useRef(null);
  const usesRef = useRef(null);
  const directionRef = useRef(null);
  const sideEffectRef = useRef(null);
  const preserveRef = useRef(null);
  const contentWrapRef = useRef(null);

  const isLoggedIn = useSelector((state) => state.cart.isLoggedIn);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data: productData } = await axios.get(
          `http://localhost:5000/api/products/${id}`
        );
        setProduct(productData);

        const { data: imageData } = await axios.get(
          `http://localhost:5000/api/images?product_id=${productData.id}`
        );
        const urls = imageData.map((img) => img.url);
        setImages(urls);
        setSelectedImage(urls[0] || "");

        const { data: detailData } = await axios.get(
          `http://localhost:5000/api/details?product_id=${productData.id}`
        );
        setDetails(detailData);

        const { data: ingredientData } = await axios.get(
          `http://localhost:5000/api/ingredients?product_id=${productData.id}`
        );
        setIngredients(ingredientData);
      } catch (error) {
        console.error("Error fetching product info", error);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (contentWrapRef.current) {
      setTimeout(() => {
        setContentOverflow(
          contentWrapRef.current.scrollHeight > MAX_CONTENT_HEIGHT
        );
      }, 100);
    }
  }, [product, details, ingredients]);

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value);
    if (value > 0) setQuantity(value);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => setQuantity(quantity + 1);

  const handleAddToCart = () => {
    try {
      dispatch(addToCart(id, quantity));
      setAlertMessage(
        isLoggedIn
          ? "Thêm vào giỏ hàng thành công!"
          : "Sản phẩm đã được thêm vào giỏ hàng tạm thời"
      );
      setAlertType("success");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    } catch (error) {
      setAlertMessage("Có lỗi xảy ra khi thêm vào giỏ hàng!");
      setAlertType("error");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleMenuClick = (ref, tabKey, alignTo = "center") => {
    setActiveTab(tabKey);
    setShowMoreAll(true);
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: alignTo });
    }, 100);
  };

  // Modal xem ảnh
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIdx, setModalImageIdx] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 }); // offset khi kéo ảnh
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const openImageModal = (idx) => {
    setModalImageIdx(idx);
    setZoomLevel(1);
    setImgOffset({ x: 0, y: 0 });
    setShowImageModal(true);
  };
  const closeImageModal = () => setShowImageModal(false);

  const handleModalPrev = (e) => {
    e.stopPropagation();
    setModalImageIdx((prev) => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
    setImgOffset({ x: 0, y: 0 });
  };
  const handleModalNext = (e) => {
    e.stopPropagation();
    setModalImageIdx((prev) => (prev + 1) % images.length);
    setZoomLevel(1);
    setImgOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel(2.5);
    setImgOffset({ x: 0, y: 0 });
  };
  const handleZoomOut = () => {
    setZoomLevel(1);
    setImgOffset({ x: 0, y: 0 });
  };

  // Xử lý kéo ảnh
  const onMouseDown = (e) => {
    if (zoomLevel === 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - imgOffset.x, y: e.clientY - imgOffset.y });
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setImgOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  return (
    <div className="product-detail-container">
      <Header />

      {showAlert && (
        <div
          className={`alert ${
            alertType === "success" ? "alert-success" : "alert-error"
          }`}
        >
          {alertMessage}
        </div>
      )}

      <div className="product-detail-top">
        <div className="product-detail-images">
          <img
            src={selectedImage || "https://via.placeholder.com/300"}
            alt={product.name}
            className="main-image"
            onClick={() => {
              const idx = images.findIndex((url) => url === selectedImage);
              openImageModal(idx !== -1 ? idx : 0);
            }}
            style={{ cursor: "zoom-in" }}
          />
          <div className="thumbnail-container">
            {images.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`thumbnail-${idx}`}
                className={`thumbnail-image ${
                  url === selectedImage ? "active" : ""
                }`}
                onClick={() => {
                  setSelectedImage(url);
                  openImageModal(idx);
                }}
              />
            ))}
          </div>
        </div>
        <div className="product-detail-info">
          <h1 className="product-title">{product.name}</h1>
          <div className="product-price">
            {product.price && formatPrice(product.price)}/{product.unit}
          </div>
          <div>
            {details.length > 0 ? (
              <table className="detail-table">
                <thead>
                  <tr>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((detail, index) => (
                    <tr key={index}>
                      <td className="detail-table-key">{detail.key_name}</td>
                      <td className="detail-table-value">{detail.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              "Không có thông tin chi tiết"
            )}
          </div>
          <p>Số lượng</p>
          <div className="quantity-selector">
            <button onClick={decreaseQuantity}>-</button>
            <a>{quantity}</a>
            <button onClick={increaseQuantity}>+</button>
          </div>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
      <div className="product-detail-tabs">
        <div className="tab-buttons">
          <button
            className={activeTab === "description" ? "active" : ""}
            onClick={() => handleMenuClick(descriptionRef, "description")}
          >
            Mô tả
          </button>
          <button
            className={activeTab === "ingredient" ? "active" : ""}
            onClick={() => handleMenuClick(ingredientRef, "ingredient")}
          >
            Thành phần
          </button>
          <button
            className={activeTab === "uses" ? "active" : ""}
            onClick={() => handleMenuClick(usesRef, "uses")}
          >
            Công dụng
          </button>
          <button
            className={activeTab === "direction" ? "active" : ""}
            onClick={() => handleMenuClick(directionRef, "direction")}
          >
            Cách dùng
          </button>
          <button
            className={activeTab === "sideEffect" ? "active" : ""}
            onClick={() => handleMenuClick(sideEffectRef, "sideEffect")}
          >
            Tác dụng phụ
          </button>
          <button
            className={activeTab === "preserve" ? "active" : ""}
            onClick={() => handleMenuClick(preserveRef, "preserve")}
          >
            Lưu ý & Bảo quản
          </button>
        </div>
        <div
          className="tab-content"
          ref={contentWrapRef}
          style={
            !showMoreAll
              ? {
                  maxHeight: MAX_CONTENT_HEIGHT,
                  overflow: "hidden",
                  position: "relative",
                }
              : {
                  maxHeight: "80vh",
                  overflowY: "auto",
                  position: "relative",
                }
          }
        >
          <div ref={descriptionRef}>
            <div className="tab-content-title">Mô tả</div>
            <div style={{ whiteSpace: "pre-line" }}>{product.description}</div>
          </div>
          <div ref={ingredientRef}>
            <div className="tab-content-title">Thành phần</div>
            {ingredients.length > 0 ? (
              <table className="ingredient-table">
                <thead>
                  <tr>
                    <th>Thành phần</th>
                    <th>Hàm lượng</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing, idx) => (
                    <tr key={idx}>
                      <td>{ing.name}</td>
                      <td>{ing.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>Không có thông tin thành phần</div>
            )}
          </div>

          <div ref={usesRef}>
            <div className="tab-content-title">Công dụng</div>
            <div style={{ whiteSpace: "pre-line" }}>{product.uses}</div>
          </div>

          <div ref={directionRef}>
            <div className="tab-content-title">Cách dùng</div>
            <div style={{ whiteSpace: "pre-line" }}>{product.how_use}</div>
          </div>

          <div ref={sideEffectRef}>
            <div className="tab-content-title">Tác dụng phụ</div>
            <div style={{ whiteSpace: "pre-line" }}>{product.side_effects}</div>
          </div>

          <div ref={preserveRef}>
            <div className="tab-content-title">Lưu ý & Bảo quản</div>
            <div style={{ whiteSpace: "pre-line" }}>{product.preserve}</div>
          </div>

          {!showMoreAll && contentOverflow && (
            <div className="desc-gradient-fade" />
          )}
        </div>
      </div>
      {contentOverflow && (
        <button
          className="show-more-btn"
          onClick={() => setShowMoreAll((v) => !v)}
        >
          {showMoreAll ? "Ẩn bớt ▲" : "Xem thêm ▼"}
        </button>
      )}

      {showImageModal && (
        <div className="product-image-modal" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeImageModal}>
              ×
            </button>
            <button className="modal-nav prev" onClick={handleModalPrev}>
              &lt;
            </button>
            <div
              className="modal-image-wrapper"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              style={{
                cursor:
                  zoomLevel > 1
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "zoom-in",
              }}
            >
              <img
                src={images[modalImageIdx]}
                alt={`modal-${modalImageIdx}`}
                className="modal-image"
                style={{
                  transform: `scale(${zoomLevel}) translate(${
                    imgOffset.x / zoomLevel
                  }px, ${imgOffset.y / zoomLevel}px)`,
                  transition: isDragging ? "none" : "transform 0.18s",
                }}
                draggable={false}
              />
            </div>
            <button className="modal-nav next" onClick={handleModalNext}>
              &gt;
            </button>
            <div className="modal-zoom-controls">
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel === 2.5}
                title="Phóng to"
              >
                <MdOutlineZoomIn size={26} />
              </button>
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel === 1}
                title="Thu nhỏ"
              >
                <MdOutlineZoomOut size={26} />
              </button>
            </div>
            <div className="modal-thumbnails">
              {images.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`thumb-modal-${idx}`}
                  className={`modal-thumb ${
                    idx === modalImageIdx ? "active" : ""
                  }`}
                  onClick={() => {
                    setModalImageIdx(idx);
                    setZoomLevel(1);
                    setImgOffset({ x: 0, y: 0 });
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductInformation;
