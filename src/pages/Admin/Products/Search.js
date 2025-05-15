import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import axiosInstance from '../../../utils/axiosConfig';
import { Link, useLocation } from 'react-router-dom';
import './Search.css';
import Header from '../../../components/Header/Header';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../../redux/addCart';

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
  
  // Sử dụng Redux thay vì useCart hook
  const isLoggedIn = useSelector(state => state.cart.isLoggedIn);
  const dispatch = useDispatch();
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

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

  const addToCart = (productId) => {
    try {
      // Sử dụng Redux dispatch trực tiếp
      dispatch(addToCart({ productId, quantity: 1 }));

      setAlertMessage('Thêm vào giỏ hàng thành công!');
      setAlertType('success');
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      setAlertMessage('Có lỗi xảy ra khi thêm vào giỏ hàng!');
      setAlertType('error');
    } finally {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
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

  // Hàm format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  return (
    <div className="home-container">
      <div>
        <Header />
      </div>
      
      {showAlert && (
        <div className={`alert ${alertType === 'success' ? 'alert-success' : 'alert-error'}`}>
          {alertMessage}
        </div>
      )}
      
      <h2>
        {categoryId
          ? `Kết quả theo danh mục: ${categoryId}`
          : query
          ? `Kết quả tìm kiếm cho: "${query}"`
          : 'Tìm kiếm sản phẩm'}
      </h2>

      <div className="product-list">
        {products.map(product => (
          <div className="product-card" key={product.id}>
            {product.image && <img src={product.image} alt={product.name} />}
            <div className="product-info">
              <h3><Link to={`/productInfor/${product.id}`}>{product.name}</Link></h3>
              <p className="price">{formatPrice(product.price)}</p>
            </div>
            <button 
              className="add-to-cart-btn"
              onClick={() => addToCart(product.id)}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        ))}
        
        {/* Hiển thị thông báo không tìm thấy sản phẩm */}
        {!loading && products.length === 0 && (
          <div className="no-results">Không tìm thấy sản phẩm</div>
        )}
      </div>
      
      {/* Nút hiển thị thêm (chỉ khi tìm kiếm bằng từ khóa) */}
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
    </div>
  );
};

export default SearchResults;
