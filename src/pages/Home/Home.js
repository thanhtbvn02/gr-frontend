import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './home.css';
import {Header, Footer, ScrollingBar, Category} from '../../components'

export default function Home() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/products/paginate?offset=${offset}&limit=${limit}`);
      const withImages = [];

      for (const product of res.data) {
        const imgRes = await axios.get(`http://localhost:5000/api/images?product_id=${product.id}`);
        const firstImage = imgRes.data?.[0]?.url || null;
        withImages.push({ ...product, image: firstImage });
      }

      setProducts(prev => {
        const merged = [...prev, ...withImages];
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


  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="home-container">

        <div>
            <Header />
            <Category />
        </div>
      <div className="home-container">
            {/* Tìm kiếm */}
      
            {/* Danh sách sản phẩm */}
            <div className="product-list">
              {products.map(product => (
                <div className="product-card" key={product.id}>
                  {product.image && <img src={product.image} alt={product.name} />}
                  <div className="product-info">
                    <h3><Link to={`/productInfor/${product.id}`}>{product.name}</Link></h3>
                    <p className="price">Giá: {product.price} Đồng / {product.unit}</p>
                  </div>
                  <button>
                    Thêm vào giỏ hàng
                  </button>
                </div>
              ))}
            </div>
      
            {/* Nút hiển thị thêm */}
            <div>
              {!loading && (
                <button className="load-more-btn" onClick={fetchProducts}>
                  Hiển thị thêm
                </button>
              )}
              {loading && <p>Đang tải...</p>}
            </div>
          </div>
      <div>
        <ScrollingBar />
        <Footer />
      </div>
    </div>
  );
}
