import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import "./Search.css";
import categoryTree from "./Category_tree.json";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../../../redux/addCart";
import useProduct from "../../../hooks/useProduct";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SearchResults = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [allCategories, setAllCategories] = useState([]);
  const isFirstLoad = useRef(true);

  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");
  const categoryId = new URLSearchParams(location.search).get("category_id");

  const isLoggedIn = useSelector((state) => state.cart.isLoggedIn);
  const dispatch = useDispatch();

  const { searchProductPaginated, fetchProductsByCategory } = useProduct();

  const fetchAllCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/category");
      setAllCategories(res.data);
    } catch (err) {
      toast.error("Lỗi khi tải danh mục!");
    }
  };

  const getAllChildCategoryIds = (parentId) => {
    const result = [];
    const stack = [parseInt(parentId)];
    while (stack.length > 0) {
      const current = stack.pop();
      result.push(current);
      const children = allCategories.filter((cat) => cat.parent_id === current);
      children.forEach((child) => stack.push(child.id));
    }
    return result;
  };

  const attachImages = async (productList) => {
    return await Promise.all(
      productList.map(async (product) => {
        try {
          const imgRes = await axios.get(
            `http://localhost:5000/api/images?product_id=${product.id}`
          );
          const firstImage = imgRes.data?.[0]?.url || null;
          return { ...product, image: firstImage };
        } catch {
          return { ...product, image: null };
        }
      })
    );
  };

  const fetchSearchResults = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await searchProductPaginated({
        keyword: query,
        offset,
        limit,
      });
      const withImages = await attachImages(res);
      setProducts((prev) => {
        const merged = [...prev, ...withImages];
        const unique = Array.from(
          new Map(merged.map((p) => [p.id, p])).values()
        );
        return unique;
      });
      setOffset((prev) => prev + limit);
      if (isFirstLoad.current) {
        setLimit(8);
        isFirstLoad.current = false;
      }
      if (withImages.length === 0) toast.info("Không tìm thấy sản phẩm nào!");
    } catch (err) {
      toast.error("Lỗi khi tìm sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const fetchByCategoryTree = async () => {
    if (!categoryId || allCategories.length === 0) return;
    setLoading(true);
    try {
      const ids = getAllChildCategoryIds(categoryId);
      let allProducts = [];
      for (const id of ids) {
        const res = await fetchProductsByCategory({ categoryId: id });
        allProducts.push(...res);
      }
      const unique = Array.from(
        new Map(allProducts.map((p) => [p.id, p])).values()
      );
      const withImages = await attachImages(unique);
      setProducts(withImages);
      if (withImages.length === 0) toast.info("Không tìm thấy sản phẩm nào!");
    } catch (err) {
      toast.error("Lỗi khi tìm theo cây danh mục!");
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchAllCategories();
  }, []);

  useEffect(() => {
    setProducts([]);
    setOffset(0);
    setLimit(20);
    isFirstLoad.current = true;
    if (categoryId && allCategories.length > 0) {
      fetchByCategoryTree();
    } else if (query) {
      fetchSearchResults();
    }
  }, [query, categoryId, allCategories]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  function findPathInTree(tree, targetId, path = []) {
    for (const node of tree) {
      if (node.id === Number(targetId)) {
        return [...path, node];
      }
      if (node.children && node.children.length > 0) {
        const result = findPathInTree(node.children, targetId, [...path, node]);
        if (result) return result;
      }
    }
    return null;
  }

  return (
    <div className="home-container" style={{ marginTop: "90px" }}>
      <ToastContainer position="top-right" autoClose={2200} />
      <div>
        <Header />
      </div>
      <h2 className="search-title">
        {categoryId ? (
          <div className="breadcrumb">
            <Link to="/" className="breadcrumb-home">
              Trang chủ
            </Link>
            {findPathInTree(categoryTree, categoryId)?.map((cat, idx, arr) => (
              <span key={cat.id}>
                <span className="breadcrumb-separator">/</span>
                {idx < arr.length - 1 ? (
                  <Link
                    to={`/search?category_id=${cat.id}`}
                    className="breadcrumb-link"
                  >
                    {cat.name}
                  </Link>
                ) : (
                  <span className="breadcrumb-current">{cat.name}</span>
                )}
              </span>
            ))}
          </div>
        ) : query ? (
          `Kết quả tìm kiếm cho: "${query}"`
        ) : (
          "Tìm kiếm sản phẩm"
        )}
      </h2>
      <div className="product-list">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            {product.image && <img src={product.image} alt={product.name} />}
            <div className="product-info">
              <h3>
                <Link to={`/productInfor/${product.id}`}>{product.name}</Link>
              </h3>
              <p className="price">{formatPrice(product.price)}</p>
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
        {!loading && products.length === 0 && (
          <div className="no-results">Không tìm thấy sản phẩm</div>
        )}
      </div>
      {!categoryId && query && (
        <div className="load-more-container">
          {!loading && products.length > 0 && (
            <button className="load-more-btn" onClick={fetchSearchResults}>
              Hiển thị thêm
            </button>
          )}
          {loading && <div className="loading">Đang tải...</div>}
        </div>
      )}
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default SearchResults;
