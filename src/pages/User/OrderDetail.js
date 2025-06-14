import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrderDetail.css";

function getStatus(key) {
  const map = {
    pending: {
      label: "Chờ xác nhận",
      className: "badge badge-pending",
      tabClass: "order-tab-pending",
    },
    processing: {
      label: "Đang xử lý",
      className: "badge badge-processing",
      tabClass: "order-tab-processing",
    },
    delivered: {
      label: "Đã giao",
      className: "badge badge-delivered",
      tabClass: "order-tab-delivered",
    },
    cancelled: {
      label: "Đã huỷ",
      className: "badge badge-cancelled",
      tabClass: "order-tab-cancelled",
    },
  };
  return map[key] || { label: key, className: "badge", tabClass: "" };
}

function OrderDetail({ orderCode }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);
  const [productImages, setProductImages] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!orderCode) {
      setError("Không tìm thấy đơn hàng");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/orders/${orderCode}`
        );
        setOrder(res.data);
      } catch (err) {
        setError("Không thể tải chi tiết đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderCode]);

  // Lấy thông tin địa chỉ nhận hàng
  useEffect(() => {
    if (order && order.address_id) {
      axios
        .get(`http://localhost:5000/api/addresses/${order.address_id}`)
        .then((res) => setAddress(res.data))
        .catch(() => setAddress(null));
    }
  }, [order]);

  // Lấy ảnh sản phẩm cho từng item
  useEffect(() => {
    if (order && order.items) {
      const fetchImages = async () => {
        const imagesMap = {};
        await Promise.all(
          order.items.map(async (item) => {
            try {
              const res = await axios.get(
                `http://localhost:5000/api/images?product_id=${item.product_id}`
              );
              imagesMap[item.product_id] = res.data[0]?.url || null;
            } catch {
              imagesMap[item.product_id] = null;
            }
          })
        );
        setProductImages(imagesMap);
      };
      fetchImages();
    }
  }, [order]);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;
  if (!order) return <div>Không tìm thấy đơn hàng</div>;

  const isCancelled = order.status === "cancelled";
  const isProcessing = order.status === "processing";
  const { label: statusLabel, className } = getStatus(order.status);

  // Địa chỉ nhận
  const recipient = address?.recipient_name || "Người nhận";
  const phone = address?.phone || "";
  const addressStr = address
    ? `${address.street}, ${address.ward}, ${address.district}, ${address.province}`
    : "";

  // Sản phẩm
  const items = order.items || [];
  // Tổng tiền
  const total = Number(order.total_amount || 0);
  // Phương thức thanh toán
  let paymentLabel = "";
  if (order.payment_method === "cash_on_delivery") paymentLabel = "Tiền mặt";
  else if (order.payment_method === "vnpay")
    paymentLabel = "Thanh toán qua VNPay";
  else paymentLabel = order.payment_method;

  const handleUpdateStatus = async (newStatus) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      await axios.put(`http://localhost:5000/api/orders/${order.id}`, {
        status: newStatus,
      });
      setOrder({ ...order, status: newStatus });
    } catch {
      alert("Cập nhật trạng thái thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <h2>Chi tiết đơn hàng</h2>
        {isCancelled && (
          <div className="order-detail-status-fail">
            <b>Đặt hàng thất bại</b>
            <div>
              Đơn hàng đã huỷ. Cần hỗ trợ vui lòng liên hệ tổng đài{" "}
              <a>1800 6821</a>
            </div>
          </div>
        )}
      </div>
      <div className="order-detail-status-row">
        <span className={`order-detail-status-badge ${className}`}>
          {statusLabel}
        </span>
        <span className="order-detail-ship">Giao hàng tận nơi</span>
      </div>
      <div className="order-detail-shipping">
        <div>
          <b>Đơn vị vận chuyển</b>
        </div>
        <div>Ahamove</div>
        {isCancelled && <div className="order-detail-ship-cancel">Huỷ</div>}
        <div className="order-detail-ship-time">
          {order.updated_at ? new Date(order.updated_at).toLocaleString() : ""}
        </div>
        {isCancelled && (
          <div className="order-detail-ship-note">Đơn hàng của bạn đã huỷ.</div>
        )}
      </div>
      <div className="order-detail-info-row">
        <div>
          <div>
            <b>Thông tin người nhận</b>
          </div>
          <div>
            {recipient} | {phone}
          </div>
          <div>{addressStr}</div>
        </div>
        <div>
          <div>
            <b>Mã đơn hàng</b>
          </div>
          <div>
            {order.order_code}{" "}
            <span
              className="order-detail-copy"
              onClick={() => {
                navigator.clipboard.writeText(order.order_code);
              }}
            >
              Sao chép
            </span>
          </div>
          <div>
            Thời gian đặt hàng
            <br />
            {order.created_at
              ? new Date(order.created_at).toLocaleString()
              : ""}
          </div>
        </div>
      </div>
      <div className="order-detail-products">
        <div className="order-detail-products-title">Sản phẩm đã mua</div>
        <table className="order-detail-products-table">
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="order-detail-product-img">
                  {productImages[item.product_id] ? (
                    <img
                      src={productImages[item.product_id]}
                      alt={item.product?.name}
                      width={40}
                    />
                  ) : (
                    <div className="order-detail-product-img-placeholder" />
                  )}
                </td>
                <td>
                  <div>{item.product ? item.product.name : "Sản phẩm"}</div>
                  <div className="order-detail-product-type">
                    {item.product ? item.product.type : ""}
                  </div>
                </td>
                <td>x{item.quantity}</td>
                <td>{Number(item.unit_price).toLocaleString()} ₫</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="order-detail-payment">
        <div className="order-detail-payment-title">Chi tiết thanh toán</div>
        <div className="order-detail-payment-row">
          <span>Tiền hàng</span>
          <span>{total.toLocaleString()} ₫</span>
        </div>
        <div className="order-detail-payment-row">
          <span>Phí vận chuyển</span>
          <span>0 ₫</span>
        </div>
        <div className="order-detail-payment-row order-detail-payment-total">
          <span>Tổng tiền ({items.length} sản phẩm)</span>
          <span style={{ color: "#eb5757", fontWeight: 700, fontSize: 20 }}>
            {total.toLocaleString()} ₫
          </span>
        </div>
        <div className="order-detail-payment-row">
          <span>Phương thức thanh toán</span>
          <span>
            {order.payment_method === "cash_on_delivery" && (
              <span className="order-detail-cod">COD</span>
            )}{" "}
            {paymentLabel}
          </span>
        </div>
        {isProcessing && (
          <div className="is-delivery">
            <button
              className="is-delivery-button"
              onClick={() => handleUpdateStatus("delivered")}
              disabled={isUpdating}
            >
              {isUpdating ? "Đang cập nhật..." : "Đã nhận hàng"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetail;
