import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideBar from "../../../components/SideBar/SideBar";
import Category from "../../../components/Header/Category";
import "./ManageProduct.css";
import { MdDelete, MdOutlineSearch } from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import useProduct from "../../../hooks/useProduct";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function formatPrice(price) {
  return Number(price).toLocaleString("vi-VN");
}

const ManageProduct = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const {
    fetchProductsByCategory,
    searchProductPaginated,
    deleteProducts,
    fetchProducts,
  } = useProduct();

  const fetchProductsData = async (categoryId = null, reset = false) => {
    setLoading(true);
    try {
      let productsData = [];
      if (categoryId) {
        productsData = await fetchProductsByCategory({
          categoryId,
          offset: reset ? 0 : offset,
          limit,
        });
      } else {
        productsData = await fetchProducts({
          offset: reset ? 0 : offset,
          limit,
        });
      }
      const withImages = [];
      for (const product of productsData) {
        try {
          const imgRes = await axios.get(
            `http://localhost:5000/api/images?product_id=${product.id}`
          );
          const firstImage = imgRes.data?.[0]?.url || null;
          withImages.push({ ...product, image: firstImage });
        } catch {
          withImages.push({ ...product, image: null });
        }
      }
      if (reset) {
        setProducts(withImages);
        setFilteredProducts(withImages);
        setOffset(limit);
      } else {
        setProducts((prev) => {
          const merged = [...prev, ...withImages];
          const unique = Array.from(
            new Map(merged.map((p) => [p.id, p])).values()
            );
            return unique;
        });
        setFilteredProducts((prev) => {
          const merged = [...prev, ...withImages];
          const unique = Array.from(
            new Map(merged.map((p) => [p.id, p])).values()
          );
          return unique;
        });
        setOffset((prev) => prev + limit);
      }
    } catch (err) {
      toast.error("Lỗi khi tải danh sách sản phẩm!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductsData(selectedCategory, true);
    setSelectedProducts([]);
  }, [selectedCategory]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setOffset(0);
    setProducts([]);
    setFilteredProducts([]);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const productsData = await searchProductPaginated({
        keyword: search,
        offset: 0,
        limit,
      });
      const withImages = [];
      for (const product of productsData) {
        try {
          const imgRes = await axios.get(
            `http://localhost:5000/api/images?product_id=${product.id}`
          );
          const firstImage = imgRes.data?.[0]?.url || null;
          withImages.push({ ...product, image: firstImage });
        } catch {
          withImages.push({ ...product, image: null });
        }
      }
      setProducts(withImages);
      setFilteredProducts(withImages);
      setSelectedProducts([]);
      setOffset(0);
      if (withImages.length === 0) toast.info("Không tìm thấy sản phẩm nào!");
    } catch {
      toast.error("Lỗi khi tìm kiếm sản phẩm!");
      setProducts([]);
      setFilteredProducts([]);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setSearch("");
    fetchProductsData(selectedCategory, true);
    setSelectedProducts([]);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id, checked) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, id]);
    } else {
      setSelectedProducts((prev) => prev.filter((pid) => pid !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.length === 0) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa các sản phẩm đã chọn?"))
      return;
    setLoading(true);
    try {
      await deleteProducts(selectedProducts);
      setProducts((prev) =>
        prev.filter((p) => !selectedProducts.includes(p.id))
      );
      setFilteredProducts((prev) =>
        prev.filter((p) => !selectedProducts.includes(p.id))
      );
      setSelectedProducts([]);
      toast.success("Xóa sản phẩm thành công!");
    } catch {
      toast.error("Xóa sản phẩm thất bại!");
    }
    setLoading(false);
  };

  return (
    <div className="admin-container">
      <ToastContainer position="top-right" autoClose={2200} />
      <div className="sidebar-wrapper">
        <SideBar />
      </div>
      <div className="main-wrapper">
        <div className="product-container">
          <div className="category-section">
            <Category onCategorySelect={handleCategorySelect} />
          </div>
          <div className="order-filter-bar" style={{ marginBottom: 18 }}>
            <button
              className="add-product-btn"
              onClick={() => navigate("/admin/products/add")}
              style={{ marginRight: 10 }}
            >
              Thêm sản phẩm
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="filter-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{ maxWidth: 200 }}
            />
            <button className="btn btn-search" onClick={handleSearch}>
              <MdOutlineSearch />
            </button>
            <button className="btn btn-reset" onClick={handleReset}>
              <RiRefreshFill />
            </button>
            <button
              className="btn btn-delete11"
              disabled={selectedProducts.length === 0}
              onClick={handleDeleteSelected}
              style={{ marginLeft: "auto" }}
            >
              <MdDelete />
            </button>
          </div>
          <table className="product-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedProducts.length === filteredProducts.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Giá</th>
                <th>Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="order-row"
                  style={{
                    background: selectedProducts.includes(product.id)
                      ? "#f5f5fa"
                      : "",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/update/${product.id}`)}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectProduct(product.id, e.target.checked);
                      }}
                    />
                  </td>
                  <td>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                        style={{ width: 48, height: 48 }}
                      />
                    ) : null}
                  </td>
                  <td>{product.name}</td>
                  <td>
                    {formatPrice(product.price)} đ / {product.unit}
                  </td>
                  <td>
                    {product.stock} {product.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            {!loading && filteredProducts.length >= limit && (
              <button
                className="load-more-btn"
                onClick={() => fetchProductsData(selectedCategory)}
              >
                Hiển thị thêm
              </button>
            )}
            {loading && <p>Đang tải...</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageProduct;
