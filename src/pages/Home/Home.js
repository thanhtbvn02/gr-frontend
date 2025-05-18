import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import './home.css';
import {Header, Footer, ScrollingBar, Category} from '../../components'
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../redux/addCart';

export default function Home() {
  const navigate = useNavigate();
  
  // Sử dụng Redux thay vì useCart hook
  const isLoggedIn = useSelector(state => state.cart.isLoggedIn);
  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  const fetchOne = useRef(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `https://gr-backend.onrender.com/api/products/paginated?offset=${offset}&limit=${limit}&include_image=true`
      );
      const productsWithImages = res.data.products;

      setProducts(prev => {
        const merged = [...prev, ...productsWithImages];
        const unique = Array.from(new Map(merged.map(p => [p.id, p])).values());
        return unique;
      });

      setOffset(prev => prev + limit);
      if (offset === 0) setLimit(8);
    } catch (err) {
      console.error('Lỗi khi load sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId) => {
    if (!productId) return;
    
    try {
      // Sử dụng Redux dispatch trực tiếp
      dispatch(addToCart(productId, 1));

      setAlertMessage(isLoggedIn
        ? 'Thêm vào giỏ hàng thành công!'
        : 'Sản phẩm đã được thêm vào giỏ hàng tạm thời'
      );
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      if (error.response?.status === 403) {
        // Phiên hết hạn, chuyển đến trang đăng nhập
        navigate('/login');
        setAlertMessage('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      } else {
        setAlertMessage('Có lỗi xảy ra khi thêm vào giỏ hàng!');
      }
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  useEffect(() => {
    if (fetchOne.current) return;
    fetchOne.current = true;
  
    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      {showAlert && (
        <div className={`alert ${alertType === 'success' ? 'alert-success' : 'alert-error'}`}>
          {alertMessage}
        </div>
      )}

      <div>
        <Header />
      </div>
      <div className="home-container">
        <div className="product-list">
          {products.map(product => (
            <div className="product-card" key={product.id}>
              {product.image && <img src={product.image} alt={product.name} />}
              <div className="product-info">
                <h3><Link to={`/productInfor/${product.id}`}>{product.name}</Link></h3>
                <p className="price">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </p>
              </div>
              <button 
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(product.id)}
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          ))}
        </div>

        {/* Nút hiển thị thêm */}
        <div className="load-more-container">
          {!loading && products.length > 0 && (
            <button className="load-more-btn" onClick={fetchProducts}>
              Hiển thị thêm
            </button>
          )}
          {loading && <div className="loading">Đang tải...</div>}
        </div>
      </div>
      <div>
        <ScrollingBar />
        <Footer />
      </div>
    </div>
  );
}
