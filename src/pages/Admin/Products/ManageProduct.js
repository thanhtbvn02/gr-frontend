import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './ManageProduct.css';

const ManageProduct = () => {
  const [products, setProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="product-container">
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
          {products.map(product => (
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
          <button className="load-more-btn" onClick={fetchProducts}>
            Hiển thị thêm
          </button>
        )}
        {loading && <p>Đang tải...</p>}
      </div>
    </div>
  );
};

export default ManageProduct;
