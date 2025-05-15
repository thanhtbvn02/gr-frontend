import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import SideBar from '../../../components/SideBar/SideBar';
import Category from '../../../components/Header/Category';
import './ManageProduct.css';

const ManageProduct = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async (categoryId = null) => {
    setLoading(true);
    try {
      const url = categoryId 
        ? `http://localhost:5000/api/products/category/${categoryId}?offset=${offset}&limit=${limit}`
        : `http://localhost:5000/api/products/paginated?offset=${offset}&limit=${limit}`;
      
      const res = await axios.get(url);
      const productsData = Array.isArray(res.data) ? res.data : (res.data.products || []);
      const withImages = [];

      for (const product of productsData) {
        try {
          const imgRes = await axios.get(`http://localhost:5000/api/images?product_id=${product.id}`);
          const firstImage = imgRes.data?.[0]?.url || null;
          withImages.push({ ...product, image: firstImage });
        } catch (imgErr) {
          console.error('Lỗi khi tải ảnh sản phẩm:', imgErr);
          withImages.push({ ...product, image: null });
        }
      }

      setProducts(prev => {
        const merged = [...prev, ...withImages];
        const unique = Array.from(new Map(merged.map(p => [p.id, p])).values());
        return unique;
      });

      setFilteredProducts(prev => {
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
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setOffset(0);
    setProducts([]);
    setFilteredProducts([]);
  };

  return (
    <div className="admin-container">
      <div className="sidebar-wrapper">
        <SideBar />
      </div>
      <div className="main-wrapper">
        <div className="product-container">
          <div className="category-section">
            <Category onCategorySelect={handleCategorySelect} />
          </div>
          <div>
            <button className="add-product-btn" onClick={() => navigate('/admin/products/add')}>Thêm sản phẩm</button>
            <input type="text" placeholder="Tìm kiếm" className="search-input" />
          </div>
          <table className="product-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    {product.image && <img src={product.image} alt={product.name} className="product-image" />}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.price} Đồng / {product.unit}</td>
                  <td>{product.stock} {product.unit}</td>
                  <td>
                    <button className="action-btn">
                      <Link to={`/update/${product.id}`}>UPDATE</Link>
                    </button>
                    <button className="action-btn">
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            {!loading && (
              <button className="load-more-btn" onClick={() => fetchProducts(selectedCategory)}>
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
