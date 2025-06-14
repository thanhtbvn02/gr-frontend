import React, { useState, useEffect } from "react";
import "./Order.css";
import { useParams } from "react-router-dom";
import axios from "axios";

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

function Order({ onSelectOrder }) {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("pending");

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await axios.get(
        `http://localhost:5000/api/orders/user/${id}`
      );
      setOrders(res.data);
    };
    fetchOrders();
  }, [id]);

  const filteredOrders = orders.filter(
    (order) => order.status === selectedStatus
  );

  return (
    <div className="order-tab-container">
      <h1 className="order-title">Đơn hàng của bạn</h1>
      <div className="order-tabs">
        {["pending", "processing", "delivered", "cancelled"].map((key) => {
          const { label, tabClass } = getStatus(key);
          return (
            <button
              key={key}
              className={`order-tab-btn ${tabClass} ${
                selectedStatus === key ? "active" : ""
              }`}
              onClick={() => setSelectedStatus(key)}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="order-table-container">
        {filteredOrders.length === 0 ? (
          <div className="order-empty-table">Không có đơn hàng</div>
        ) : (
          <table className="order-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelectOrder(order.order_code)}
                >
                  <td>{order.order_code}</td>
                  <td>{Number(order.total_amount).toLocaleString()}₫</td>
                  <td>
                    {order.payment_method === "cash_on_delivery"
                      ? "Thanh toán khi nhận"
                      : order.payment_method === "vnpay"
                      ? "Thanh toán qua VNPay"
                      : order.payment_method}
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    {(() => {
                      const { label, className } = getStatus(order.status);
                      return <span className={className}>{label}</span>;
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Order;
