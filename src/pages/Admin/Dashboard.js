import React, { useState, useEffect } from "react";
import SideBar from "../../components/SideBar/SideBar";
import "./Dashboard.css";
import useUser from "../../hooks/useUser";
import useProduct from "../../hooks/useProduct";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#4096ff", "#00c853"];

function formatCurrency(number) {
  if (typeof number !== "number") return "";
  return number.toLocaleString("vi-VN") + " đ";
}

const CategoryItem = ({ node, level }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="category-item">
      <div
        className="category-header"
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="category-name">
          {node.children && node.children.length > 0 && (
            <span className="expand-icon">{expanded ? "▼" : "►"}</span>
          )}
          {node.name}
        </div>
        <div className="category-count">{node.count}</div>
      </div>
      {expanded && node.children && node.children.length > 0 && (
        <div className="category-children">
          {node.children.map((child) => (
            <CategoryItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [userStats, setUserStats] = useState({ total: 0, admins: 0, users: 0 });
  const [totalProducts, setTotalProducts] = useState(0);
  const [categoryTree, setCategoryTree] = useState([]);
  const [orderStats, setOrderStats] = useState({
    revenue: [],
    status: [],
    total: 0,
    summary: {
      pending: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0,
      total: 0,
    },
  });
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString().padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  const { countUsers, countAdmins } = useUser();
  const { countProducts } = useProduct();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userNormal, userAdmin, productCount] = await Promise.all([
          countUsers(),
          countAdmins(),
          countProducts(),
        ]);
        setUserStats({
          total: (userNormal?.count || 0) + (userAdmin?.count || 0),
          admins: userAdmin?.count || 0,
          users: userNormal?.count || 0,
        });
        setTotalProducts(productCount || 0);
      } catch (err) {}
    };
    fetchStats();
  }, [countUsers, countAdmins, countProducts]);

  useEffect(() => {
    const fetchCategoryTree = async () => {
      try {
        const { data: tree } = await axios.get(
          "http://localhost:5000/api/category/tree-with-counts"
        );
        setCategoryTree(tree);
      } catch (err) {
        setCategoryTree([]);
      }
    };
    fetchCategoryTree();
  }, []);

  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const { data: orders } = await axios.get(
          "http://localhost:5000/api/orders/all"
        );

        const monthNum = Number(selectedMonth);
        const yearNum = Number(selectedYear);
        const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

        const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
          const day = (i + 1).toString().padStart(2, "0");
          const date = `${yearNum}-${selectedMonth}-${day}`;
          return {
            date,
            revenue: 0,
            pending: 0,
            processing: 0,
            delivered: 0,
            cancelled: 0,
          };
        });

        let totalRevenue = 0;
        let summary = {
          pending: 0,
          processing: 0,
          delivered: 0,
          cancelled: 0,
          total: 0,
        };

        orders.forEach((order) => {
          let d;
          if (order.status === "delivered" && order.updated_at) {
            d = new Date(order.updated_at);
          } else {
            d = new Date(order.created_at);
          }

          if (d.getMonth() + 1 === monthNum && d.getFullYear() === yearNum) {
            const idx = d.getDate() - 1;

            if (order.status === "delivered") {
              totalRevenue += Number(order.total_amount);
              daysArray[idx].revenue += Number(order.total_amount);
              daysArray[idx].delivered++;
              summary.delivered++;
            }
            if (order.status === "pending") {
              daysArray[idx].pending++;
              summary.pending++;
            }
            if (order.status === "processing") {
              daysArray[idx].processing++;
              summary.processing++;
            }
            if (order.status === "cancelled") {
              daysArray[idx].cancelled++;
              summary.cancelled++;
            }
            summary.total++;
          }
        });

        setOrderStats({
          revenue: daysArray.map((d) => ({ date: d.date, revenue: d.revenue })),
          status: daysArray.map((d) => ({
            date: d.date,
            pending: d.pending,
            processing: d.processing,
            delivered: d.delivered,
            cancelled: d.cancelled,
          })),
          total: totalRevenue,
          summary,
        });
      } catch (err) {
        setOrderStats({
          revenue: [],
          status: [],
          total: 0,
          summary: {
            pending: 0,
            processing: 0,
            delivered: 0,
            cancelled: 0,
            total: 0,
          },
        });
      }
    };
    fetchOrderStats();
  }, [selectedMonth, selectedYear]);

  const userPieData = [
    { name: "User", value: userStats.users },
    { name: "Admin", value: userStats.admins },
  ];

  return (
    <div className="admin-container">
      <div className="sidebar-wrapper">
        <SideBar />
      </div>
      <div className="main-wrapper">
        <h1>Dashboard</h1>
        <div className="dashboard-flex-row">
          <div className="dashboard-flex-col-main">
            <div className="stats-card">
              <h2>
                Tổng sản phẩm: <span>{totalProducts}</span>
              </h2>
              <div className="category-tree-container">
                <h3 style={{ marginTop: 12 }}>Sản phẩm theo danh mục</h3>
                <div className="category-tree">
                  {categoryTree.map((node) => (
                    <CategoryItem key={node.id} node={node} level={0} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-flex-col-side">
            <div className="stats-card">
              <h2 style={{ textAlign: "center", marginBottom: 12 }}>
                Người dùng / Admin
              </h2>
              <ResponsiveContainer
                width="100%"
                height={220}
                style={{ marginTop: 30 }}
              >
                <PieChart>
                  <Pie
                    data={userPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {userPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: "center", fontSize: 18, marginTop: 8 }}>
                Tổng: <b>{userStats.total}</b>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span>Chọn tháng</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {[2023, 2024, 2025].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <h2 style={{ color: "#4096ff", textAlign: "center", margin: 8 }}>
            Doanh thu tháng {selectedMonth}/{selectedYear}:{" "}
            {formatCurrency(orderStats.total)}
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={orderStats.revenue}
              margin={{ top: 20, right: 30, left: 40, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Doanh thu ngày"
                stroke="#4096ff"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="stats-card">
          <h2 style={{ textAlign: "center", margin: 8 }}>
            Trạng thái đơn hàng từng ngày
          </h2>
          <h3 style={{ textAlign: "center" }}>
            Tổng số đơn: {orderStats.summary.total}
          </h3>
          <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
            <div>
              <div>Chờ xác nhận</div>
              <div style={{ color: "#ffa500", fontWeight: "bold" }}>
                {orderStats.summary.pending}
              </div>
            </div>
            <div>
              <div>Đang xử lý</div>
              <div style={{ color: "#2196f3", fontWeight: "bold" }}>
                {orderStats.summary.processing}
              </div>
            </div>
            <div>
              <div>Hoàn thành</div>
              <div style={{ color: "#00c853", fontWeight: "bold" }}>
                {orderStats.summary.delivered}
              </div>
            </div>
            <div>
              <div>Huỷ</div>
              <div style={{ color: "#ff5252", fontWeight: "bold" }}>
                {orderStats.summary.cancelled}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={orderStats.status}
              margin={{ top: 20, right: 30, left: 40, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="pending"
                name="Chờ xác nhận"
                stroke="#ffa500"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="processing"
                name="Đang xử lý"
                stroke="#2196f3"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="delivered"
                name="Hoàn thành"
                stroke="#00c853"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="cancelled"
                name="Huỷ"
                stroke="#ff5252"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
