import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { removeFromCart } from "../../redux/addCart";
import Header from "../../components/Header/Header";
import "./VNPayReturn.css";
import useProduct from "../../hooks/useProduct";

function VNPayReturn() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orderProcessedRef = useRef(false);
  const { getProductById } = useProduct();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [vnpayInfo, setVnpayInfo] = useState(null);
  const [productDetails, setProductDetails] = useState([]);
  const [productData, setProductData] = useState({});
  const [productImages, setProductImages] = useState({});

  useEffect(() => {
    const processPaymentResult = async () => {
      if (orderProcessedRef.current) {
        console.log("Đơn hàng đã được xử lý, không tạo đơn hàng lại");
        return;
      }

      try {
        const params = new URLSearchParams(location.search);
        const paymentStatus = params.get("status");

        setStatus(paymentStatus);

        const vnpayData = {};
        for (const [key, value] of params.entries()) {
          if (key.startsWith("vnp_")) {
            vnpayData[key] = value;
          }
        }
        setVnpayInfo(vnpayData);

        const pendingOrderData = localStorage.getItem("pendingOrder");
        const selectedItemsData = localStorage.getItem("selectedItems");
        const cartData = localStorage.getItem("cartData");

        let localOrderData = {};
        let orderProducts = [];

        if (pendingOrderData) {
          localOrderData = JSON.parse(pendingOrderData);
          console.log("Pending order data:", localOrderData);

          if (
            localOrderData.orderItems &&
            Array.isArray(localOrderData.orderItems)
          ) {
            orderProducts = localOrderData.orderItems;
            console.log("Products from pendingOrder:", orderProducts);
          } else if (
            localOrderData.products &&
            Array.isArray(localOrderData.products)
          ) {
            orderProducts = localOrderData.products;
            console.log(
              "Products from pendingOrder (old format):",
              orderProducts
            );
          }
        }

        if (orderProducts.length === 0 && selectedItemsData) {
          const selectedIds = JSON.parse(selectedItemsData);
          console.log("Selected items IDs:", selectedIds);

          if (cartData) {
            const cart = JSON.parse(cartData);
            if (Array.isArray(cart) && cart.length > 0) {
              if (Array.isArray(selectedIds)) {
                orderProducts = cart.filter((item) =>
                  selectedIds.includes(item.product_id.toString())
                );
              } else {
                orderProducts = cart;
              }
              console.log("Products filtered from cart:", orderProducts);
            }
          }
        }

        setProductDetails(orderProducts);

        if (orderProducts.length > 0) {
          await fetchProductDetails(orderProducts);
        }

        if (paymentStatus === "success") {
          setMessage(
            "Thanh toán thành công! Đơn hàng của bạn đang được xử lý."
          );

          if (
            Object.keys(vnpayData).length > 0 &&
            pendingOrderData &&
            orderProducts.length > 0
          ) {
            try {
              if (orderProcessedRef.current) {
                console.log("Đơn hàng đã được xử lý, không tạo đơn hàng lại");
                return;
              }

              orderProcessedRef.current = true;
              console.log(
                "Đánh dấu đơn hàng đã xử lý:",
                orderProcessedRef.current
              );

              const token = localStorage.getItem("accessToken");
              const headers = token
                ? {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  }
                : {};

              const apiOrderData = {
                user_id: localOrderData.user_id,
                address_id: localOrderData.address_id,
                payment_method: "vnpay",
                message: localOrderData.message || "",
                orderItems: orderProducts.map((product) => ({
                  product_id: product.product_id,
                  quantity: product.quantity,
                  unit_price: product.unit_price,
                })),
              };

              console.log("Sending order data to API:", apiOrderData);

              const response = await axios.post(
                "http://localhost:5000/api/orders",
                apiOrderData,
                {
                  headers,
                  timeout: 10000,
                }
              );

              console.log("Order API response:", response.data);

              for (const product of orderProducts) {
                try {
                  const cartResponse = await axios.get(
                    "http://localhost:5000/api/cart",
                    {
                      headers,
                      timeout: 10000,
                    }
                  );

                  if (cartResponse.data && Array.isArray(cartResponse.data)) {
                    const cartItem = cartResponse.data.find(
                      (item) =>
                        item.product_id.toString() ===
                        product.product_id.toString()
                    );

                    if (cartItem && cartItem.id) {
                      console.log(
                        `Xóa sản phẩm ${product.product_id} với cart ID: ${cartItem.id}`
                      );
                      await axios.delete(
                        `http://localhost:5000/api/cart/${cartItem.id}`,
                        {
                          headers,
                          timeout: 10000,
                        }
                      );
                    }
                  }
                } catch (deleteErr) {
                  console.error(
                    `Lỗi khi xóa sản phẩm ${product.product_id} khỏi giỏ hàng:`,
                    deleteErr
                  );
                }

                dispatch(removeFromCart(product.product_id));
              }

              localStorage.removeItem("pendingOrder");
              localStorage.removeItem("selectedItems");

              const orderData = {
                totalAmount: parseInt(vnpayData.vnp_Amount || 0) / 100,
                orderInfo: vnpayData.vnp_OrderInfo || "Không có thông tin",
                transactionNo:
                  vnpayData.vnp_TransactionNo || "Không có mã giao dịch",
                payDate: vnpayData.vnp_PayDate || "Không có ngày thanh toán",
                bankCode: vnpayData.vnp_BankCode || "Không có ngân hàng",
                cardType: vnpayData.vnp_CardType || "Không có loại thẻ",
                products: orderProducts,
                address_id: localOrderData.address_id,
                user_id: localOrderData.user_id,
                message: localOrderData.message || "",
              };
              setOrderDetails(orderData);
            } catch (error) {
              orderProcessedRef.current = false;
              console.error("Lỗi khi xử lý đơn hàng:", error);
              setMessage(
                "Thanh toán thành công, nhưng có lỗi xảy ra khi xử lý đơn hàng. Vui lòng liên hệ dịch vụ khách hàng."
              );
            }
          } else {
            console.warn("Không tìm thấy thông tin sản phẩm để tạo đơn hàng!");
            setMessage(
              "Thanh toán thành công, nhưng không tìm thấy thông tin sản phẩm để tạo đơn hàng. Vui lòng liên hệ dịch vụ khách hàng."
            );
          }
        } else {
          setMessage("Thanh toán không thành công hoặc đã bị hủy.");
        }
      } catch (err) {
        console.error("Lỗi xử lý kết quả thanh toán:", err);
        setMessage(
          "Đã xảy ra lỗi khi xử lý kết quả thanh toán. Vui lòng liên hệ dịch vụ khách hàng."
        );
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    processPaymentResult();
  }, [location.search, dispatch, navigate]);

  const fetchProductDetails = async (products) => {
    try {
      const productIds = products.map((product) => product.product_id);
      const productDetailsMap = {};
      const productImagesMap = {};
      const token = localStorage.getItem("accessToken");
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : {};
      await Promise.all(
        productIds.map(async (productId) => {
          try {
            const productInfo = await getProductById(productId);
            productDetailsMap[productId] = productInfo;
            try {
              const imgRes = await axios.get(
                `http://localhost:5000/api/images?product_id=${productId}`,
                {
                  headers,
                  timeout: 10000,
                }
              );
              const imageData = imgRes.data || [];
              const firstImage = imageData[0]?.url || null;
              productImagesMap[productId] = firstImage;
            } catch (imgErr) {
              console.error(
                `Không thể tải ảnh cho sản phẩm ID ${productId}:`,
                imgErr
              );
            }
          } catch (error) {
            console.error(
              `Lỗi khi lấy thông tin sản phẩm ID: ${productId}`,
              error
            );
          }
        })
      );
      setProductData(productDetailsMap);
      setProductImages(productImagesMap);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin sản phẩm:", error);
    }
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  const handleViewOrders = () => {
    navigate("/profile/orders");
  };

  const formatPayDate = (payDate) => {
    if (!payDate || payDate === "Không có ngày thanh toán") return payDate;

    const year = payDate.substring(0, 4);
    const month = payDate.substring(4, 6);
    const day = payDate.substring(6, 8);
    const hour = payDate.substring(8, 10);
    const minute = payDate.substring(10, 12);

    return `${day}/${month}/${year} ${hour}:${minute}`;
  };

  return (
    <>
      <div className="vnpay-return-container" style={{ paddingTop: 90 }}>
        <Header />
        <div className="vnpay-return-card">
          {loading ? (
            <div className="loading-spinner">
              Đang xử lý kết quả thanh toán...
            </div>
          ) : (
            <>
              <div className={`status-icon ${status}`}>
                {status === "success" ? "✓" : "✕"}
              </div>
              <h1 className="result-title">
                {status === "success"
                  ? "Thanh toán thành công"
                  : "Thanh toán thất bại"}
              </h1>
              <p className="result-message">{message}</p>

              {status === "success" && (
                <div className="order-summary">
                  <h2>Thông tin đơn hàng</h2>

                  {vnpayInfo && (
                    <>
                      <p>
                        <strong>Mã giao dịch:</strong>{" "}
                        {vnpayInfo.vnp_TransactionNo || "Không có"}
                      </p>
                      <p>
                        <strong>Ngân hàng:</strong>{" "}
                        {vnpayInfo.vnp_BankCode || "Không có"}
                      </p>
                      <p>
                        <strong>Thời gian thanh toán:</strong>{" "}
                        {formatPayDate(vnpayInfo.vnp_PayDate)}
                      </p>
                      <p>
                        <strong>Tổng tiền:</strong>{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format((vnpayInfo.vnp_Amount || 0) / 100)}
                      </p>
                      <p>
                        <strong>Nội dung thanh toán:</strong>{" "}
                        {vnpayInfo.vnp_OrderInfo || "Không có"}
                      </p>
                    </>
                  )}

                  {productDetails && productDetails.length > 0 && (
                    <>
                      <h3>Sản phẩm đã mua:</h3>
                      <table className="product-table">
                        <thead>
                          <tr>
                            <th>Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Đơn giá</th>
                            <th>Số lượng</th>
                            <th>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productDetails.map((product, index) => {
                            const productId = product.product_id;
                            const productInfo = productData[productId] || {};
                            const quantity = product.quantity || 0;
                            const price = product.unit_price || 0;

                            return (
                              <tr key={index} className="product-row">
                                <td className="image-column">
                                  <div className="product-image">
                                    {productImages[productId] ? (
                                      <img
                                        src={productImages[productId]}
                                        alt={productInfo.name || "Sản phẩm"}
                                      />
                                    ) : (
                                      <div className="no-image">
                                        Không có ảnh
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="name-column">
                                  {productInfo.name || `ID: ${productId}`}
                                </td>
                                <td className="price-column">
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(price)}
                                </td>
                                <td className="quantity-column">{quantity}</td>
                                <td className="total-column">
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(price * quantity)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <p className="order-total">
                        <strong>Tổng giá trị:</strong>{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          productDetails.reduce(
                            (total, item) =>
                              total + item.quantity * item.unit_price,
                            0
                          )
                        )}
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="action-buttons">
                <button
                  className="action-btn continue-shopping"
                  onClick={handleContinueShopping}
                >
                  Tiếp tục mua sắm
                </button>

                {status === "success" && (
                  <button
                    className="action-btn view-orders"
                    onClick={handleViewOrders}
                  >
                    Xem đơn hàng
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default VNPayReturn;
