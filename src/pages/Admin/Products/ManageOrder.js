import React, { useEffect, useState } from "react";
import SideBar from "../../../components/SideBar/SideBar";
import axios from "axios";
import vietnamData from "./Vietnam.json";
import "./ManageOrder.css";
import { RiRefreshFill } from "react-icons/ri";
import {
  MdDelete,
  MdOutlineFileDownload,
  MdOutlineSearch,
} from "react-icons/md";
import { exportToExcel } from "../../../utils/exportExcel";

const provinces = vietnamData.map((item) =>
  item.name.replace(/^Tỉnh |^Thành phố /, "")
);

function formatPrice(price) {
  return Number(price).toLocaleString("vi-VN");
}

function getStatusStyle(status) {
  switch (status) {
    case "pending":
      return { label: "Chờ xác nhận", className: "badge badge-pending" };
    case "processing":
      return { label: "Đang xử lý", className: "badge badge-processing" };
    case "delivered":
      return { label: "Đã giao", className: "badge badge-delivered" };
    case "cancelled":
      return { label: "Đã huỷ", className: "badge badge-cancelled" };
    default:
      return { label: status, className: "badge" };
  }
}

function formatDateTime(datetimeStr) {
  if (!datetimeStr) return "";
  const d = new Date(datetimeStr);
  const time = d.toLocaleTimeString("vi-VN", { hour12: false });
  const date = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
  return (
    <>
      <div>{time}</div>
      <div>{date}</div>
    </>
  );
}

function ManageOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");
  const [productImages, setProductImages] = useState({});
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [filter, setFilter] = useState({
    date: "",
    status: "",
    province: "",
    payment: "",
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/orders/all");
      setOrders(res.data);
    } catch (err) {
      setError("Không thể tải danh sách đơn hàng");
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchImages = async () => {
      if (orderItems.length === 0) return;
      const imagesMap = {};
      await Promise.all(
        orderItems.map(async (item) => {
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
  }, [orderItems]);

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleRowClick = async (order) => {
    setSelectedOrder(order);
    setShowModal(true);

    setItemsLoading(true);
    setItemsError("");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/orders/${order.order_code}`
      );
      setOrderItems(res.data.items || []);
    } catch (err) {
      setItemsError("Không thể tải thông tin sản phẩm");
      setOrderItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      await axios.put(`http://localhost:5000/api/orders/${selectedOrder.id}`, {
        status: newStatus,
      });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: newStatus }
            : order
        )
      );
      closeModal();
    } catch {
      alert("Cập nhật trạng thái thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  function formatDateToYMDLocal(dateInput) {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/orders/all");
      let filtered = res.data;
      if (filter.date) {
        filtered = filtered.filter((order) => {
          if (!order.created_at) return false;
          return formatDateToYMDLocal(order.created_at) === filter.date;
        });
      }
      if (filter.status) {
        filtered = filtered.filter((order) => order.status === filter.status);
      }
      if (filter.province) {
        filtered = filtered.filter(
          (order) =>
            order.Address?.province.replace(/^Tỉnh |^Thành phố /, "") ===
            filter.province
        );
      }
      if (filter.payment) {
        filtered = filtered.filter(
          (order) => order.payment_method === filter.payment
        );
      }
      setOrders(filtered);
      setSelectedOrders([]);
    } catch {
      setError("Lọc đơn hàng thất bại");
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setFilter({
      date: "",
      status: "",
      province: "",
      payment: "",
    });
    await fetchOrders();
    setSelectedOrders([]);
  };

  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa các đơn đã chọn?")) return;
    setLoading(true);
    try {
      for (const id of selectedOrders) {
        await axios.delete(`http://localhost:5000/api/orders/${id}`);
      }
      setOrders(orders.filter((order) => !selectedOrders.includes(order.id)));
      setSelectedOrders([]);
    } catch {
      setError("Xóa đơn hàng thất bại");
    }
    setLoading(false);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedOrders(orders.map((order) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (id, checked) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, id]);
    } else {
      setSelectedOrders(
        selectedOrders.filter((selectedId) => selectedId !== id)
      );
    }
  };

  const handleExportExcel = () => {
    const data = orders.map((order) => ({
      "Mã đơn": order.order_code,
      "Khách hàng": order.User?.full_name || "",
      "Địa chỉ": order.Address
        ? `${order.Address.street}, ${order.Address.ward}, ${order.Address.district}, ${order.Address.province}`
        : "",
      "Tổng tiền": formatPrice(order.total_amount),
      "Trạng thái": order.status,
      "Thanh toán": order.payment_method,
      "Ngày tạo": order.created_at,
    }));
    exportToExcel(data, "Danh-sach-don-hang", "Orders");
  };

  return (
    <div className="manage-order-container">
      <div className="sidebar-wrapper">
        <SideBar />
      </div>
      <div className="order-main-wrapper">
        <h1>Quản lý đơn hàng</h1>

        <div className="order-filter-bar">
          <input
            type="date"
            value={filter.date}
            onChange={(e) => setFilter((f) => ({ ...f, date: e.target.value }))}
            className="filter-input"
            placeholder="Chọn ngày"
          />
          <select
            value={filter.status}
            onChange={(e) =>
              setFilter((f) => ({ ...f, status: e.target.value }))
            }
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="processing">Đang xử lý</option>
            <option value="delivered">Đã giao</option>
            <option value="cancelled">Đã huỷ</option>
          </select>
          <select
            value={filter.payment}
            onChange={(e) =>
              setFilter((f) => ({ ...f, payment: e.target.value }))
            }
            className="filter-select"
          >
            <option value="">Tất cả thanh toán</option>
            <option value="vnpay">VNPAY</option>
            <option value="cash_on_delivery">Tiền Mặt</option>
          </select>
          <select
            value={filter.province}
            onChange={(e) =>
              setFilter((f) => ({ ...f, province: e.target.value }))
            }
            className="filter-select"
          >
            <option value="">Tất cả tỉnh thành</option>
            {provinces.map((province, idx) => (
              <option value={province} key={idx}>
                {province}
              </option>
            ))}
          </select>
          <button className="btn btn-search" onClick={handleSearch}>
            <MdOutlineSearch />
          </button>
          <button className="btn btn-reset" onClick={handleReset}>
            <RiRefreshFill />
          </button>
          <button
            className="btn btn-delete11"
            disabled={selectedOrders.length === 0}
            onClick={handleDeleteSelected}
          >
            <MdDelete />
          </button>
          <button className="btn btn-export" onClick={handleExportExcel}>
            <MdOutlineFileDownload />
          </button>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <table className="manage-order-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedOrders.length === orders.length &&
                      orders.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>ID</th>
                <th>Tên khách hàng</th>
                <th>Địa chỉ</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thanh toán</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => handleRowClick(order)}
                  className="order-row"
                  style={{
                    background: selectedOrders.includes(order.id)
                      ? "#f5f5fa"
                      : "",
                  }}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectOrder(order.id, e.target.checked);
                      }}
                    />
                  </td>
                  <td>{order.order_code}</td>
                  <td>{order.User?.full_name || order.User?.username || ""}</td>
                  <td>
                    {order.Address
                      ? `${order.Address.street}, ${order.Address.ward}, ${order.Address.district}, ${order.Address.province}`
                      : ""}
                  </td>
                  <td>{formatPrice(order.total_amount)} đ</td>
                  <td>
                    {(() => {
                      const { label, className } = getStatusStyle(order.status);
                      return <span className={className}>{label}</span>;
                    })()}
                  </td>
                  <td>
                    {order.payment_method === "vnpay"
                      ? "VNPAY"
                      : order.payment_method === "cash_on_delivery"
                      ? "Tiền Mặt"
                      : order.payment_method}
                  </td>
                  <td>{formatDateTime(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết đơn hàng</h2>
            <div className="modal-row">
              <b>Mã đơn:</b> <span>{selectedOrder.order_code}</span>
            </div>
            <div className="modal-row">
              <b>Khách hàng:</b> <span>{selectedOrder.User?.full_name}</span>
            </div>
            <div className="modal-row">
              <b>Địa chỉ:</b>{" "}
              <span>
                {selectedOrder.Address
                  ? `${selectedOrder.Address.street}, ${selectedOrder.Address.ward}, ${selectedOrder.Address.district}, ${selectedOrder.Address.province}`
                  : ""}
              </span>
            </div>
            <div className="modal-row">
              <b>Sản phẩm:</b>
            </div>
            {itemsLoading ? (
              <div>Đang tải sản phẩm...</div>
            ) : itemsError ? (
              <div style={{ color: "red" }}>{itemsError}</div>
            ) : (
              <div>
                <table className="modal-product-table">
                  <thead>
                    <tr>
                      <th>Hình ảnh</th>
                      <th>Tên sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          {productImages[item.product_id] ? (
                            <img
                              src={productImages[item.product_id]}
                              alt={item.product?.name}
                              className="modal-product-img"
                            />
                          ) : (
                            <div className="modal-product-img-placeholder" />
                          )}
                        </td>
                        <td>{item.product?.name || "Sản phẩm"}</td>
                        <td>{item.quantity}</td>
                        <td>{Number(item.unit_price).toLocaleString()} ₫</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="modal-row">
              <b>Tổng tiền:</b>{" "}
              <span>{selectedOrder.total_amount?.toLocaleString()} đ</span>
            </div>
            <div className="modal-row">
              <b>Trạng thái:</b>{" "}
              <span>{getStatusStyle(selectedOrder.status).label}</span>
            </div>
            <div className="modal-actions">
              {selectedOrder.status !== "delivered" &&
                selectedOrder.status !== "cancelled" && (
                  <>
                    <button
                      className="btn btn-confirm"
                      disabled={
                        isUpdating ||
                        selectedOrder.status === "processing" ||
                        selectedOrder.status === "delivered"
                      }
                      onClick={() => handleUpdateStatus("processing")}
                    >
                      Xác nhận
                    </button>
                    <button
                      className="btn btn-cancel"
                      disabled={
                        isUpdating || selectedOrder.status === "cancelled"
                      }
                      onClick={() => handleUpdateStatus("cancelled")}
                    >
                      Hủy đơn
                    </button>
                  </>
                )}
              <button className="btn btn-close" onClick={closeModal}>
                Đóng
              </button>
            </div>

            {isUpdating && (
              <div className="modal-updating">Đang cập nhật...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageOrder;
