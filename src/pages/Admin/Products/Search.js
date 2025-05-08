import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import './home.css';

const SearchResults = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [allCategories, setAllCategories] = useState([]);
  const isFirstLoad = useRef(true);

  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');
  const categoryId = new URLSearchParams(location.search).get('category_id');

  // Lấy danh sách tất cả danh mục
  const fetchAllCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/category');
      setAllCategories(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
    }
  };

  // Tìm tất cả ID con/cháu từ ID cha
  const getAllChildCategoryIds = (parentId) => {
    const result = [];
    const stack = [parseInt(parentId)];

    while (stack.length > 0) {
      const current = stack.pop();
      result.push(current);
      const children = allCategories.filter(cat => cat.parent_id === current);
      children.forEach(child => stack.push(child.id));
    }

    return result;
  };

  // Tìm theo từ khóa
  const fetchSearchResults = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/products/search?query=${query}&offset=${offset}&limit=${limit}`
      );

      const withImages = await Promise.all(
        res.data.map(async (product) => {
          const imgRes = await axios.get(`http://localhost:5000/api/images?product_id=${product.id}`);
          const firstImage = imgRes.data?.[0]?.url || null;
          return { ...product, image: firstImage };
        })
      );

      setProducts((prev) => {
        const merged = [...prev, ...withImages];
        const unique = Array.from(new Map(merged.map(p => [p.id, p])).values());
        return unique;
      });

      setOffset((prev) => prev + limit);
      if (isFirstLoad.current) {
        setLimit(8);
        isFirstLoad.current = false;
      }
    } catch (err) {
      console.error('Lỗi khi tìm sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tìm theo category ID + con/cháu
  const fetchByCategoryTree = async () => {
    if (!categoryId || allCategories.length === 0) return;
    setLoading(true);

    try {
      const ids = getAllChildCategoryIds(categoryId);

      const allProducts = [];
      for (const id of ids) {
        const res = await axios.get(`http://localhost:5000/api/products/category/${id}`);
        allProducts.push(...res.data);
      }

      const unique = Array.from(new Map(allProducts.map(p => [p.id, p])).values());

      const withImages = await Promise.all(unique.map(async (product) => {
        const imgRes = await axios.get(`http://localhost:5000/api/images?product_id=${product.id}`);
        const firstImage = imgRes.data?.[0]?.url || null;
        return { ...product, image: firstImage };
      }));

      setProducts(withImages);
    } catch (err) {
      console.error('Lỗi khi tìm theo cây danh mục:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load danh mục 1 lần
  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Load sản phẩm khi query thay đổi
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

  return (
    <div className="home-container">
      <h2>
        {categoryId
          ? `Kết quả theo danh mục ID: ${categoryId}`
          : query
          ? `Kết quả tìm kiếm cho: "${query}"`
          : 'Tìm kiếm sản phẩm'}
      </h2>

      <div className="product-list">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            {product.image && <img src={product.image} alt={product.name} />}
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>Tồn kho: {product.stock} {product.unit}</p>
              <p className="price">Giá: {product.price.toLocaleString()} Đồng / {product.unit}</p>
              <div className="product-actions">
                <button>
                  <Link to={`/update/${product.id}`}>UPDATE</Link>
                </button>
                <button>DELETE</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && !categoryId && (
        <button className="load-more-btn" onClick={fetchSearchResults}>
          Hiển thị thêm
        </button>
      )}
      {loading && <p>Đang tải...</p>}
    </div>
  );
};

export default SearchResults;
