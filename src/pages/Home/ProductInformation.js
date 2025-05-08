import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './ProductInformation.css'

const ProductInformation = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [details, setDetails] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        const productData = res.data;

        const imgRes = await axios.get(`http://localhost:5000/api/images?product_id=${productData.id}`);
        const firstImage = imgRes.data?.[0]?.url || null;

        setProduct({ ...productData, image: firstImage });

        const detailRes = await axios.get(`http://localhost:5000/api/detail?product_id=${id}`);
        setDetails(detailRes.data);

        const ingredientRes = await axios.get(`http://localhost:5000/api/ingredient?product_id=${id}`);
        setIngredients(ingredientRes.data);
      } catch (err) {
        console.error('Không thể lấy thông tin sản phẩm:', err);
      }
    };

    fetchProduct();
  }, [id]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="product-detail-container">
      <div className="product-detail-top">
        <div className="product-detail-images">
          <img src={product.image || 'https://via.placeholder.com/300'} alt={product.name || 'Ảnh sản phẩm'} />
        </div>

        <div className="product-detail-info">
          <h1 className="product-title">{product.name}</h1>
          <div className="product-price">
            {product.price?.toLocaleString()}đ
            {product.original_price && (
              <span className="product-original-price">{product.original_price.toLocaleString()}đ</span>
            )}
          </div>

          <div>
              {details.length > 0 ? (
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((detail, index) => (
                      <tr key={index}>
                        <td>{detail.key_name}</td>
                        <td>{detail.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : 'Không có thông tin chi tiết'}
            </div>

          <div className="quantity-selector">
            <button>-</button>
            <input type="text" value="1" readOnly style={{ width: '50px', textAlign: 'center' }} />
            <button>+</button>
          </div>

          <div>
            <button className="add-to-cart-btn">Chọn mua</button>
            <button className="find-at-pharmacy-btn">Tìm nhà thuốc</button>
          </div>
        </div>
      </div>

      <div className="product-detail-tabs">
        <div className="tab-buttons">
          <button className={activeTab === 'description' ? 'active' : ''} onClick={() => handleTabClick('description')}>Mô tả sản phẩm</button>
          <button className={activeTab === 'ingredients' ? 'active' : ''} onClick={() => handleTabClick('ingredients')}>Thành phần</button>
          <button className={activeTab === 'uses' ? 'active' : ''} onClick={() => handleTabClick('uses')}>Công dụng</button>
          <button className={activeTab === 'how_use' ? 'active' : ''} onClick={() => handleTabClick('how_use')}>Cách dùng</button>
          <button className={activeTab === 'side_effects' ? 'active' : ''} onClick={() => handleTabClick('side_effects')}>Tác dụng phụ</button>
          <button className={activeTab === 'notes' ? 'active' : ''} onClick={() => handleTabClick('notes')}>Lưu ý</button>
          <button className={activeTab === 'preserve' ? 'active' : ''} onClick={() => handleTabClick('preserve')}>Bảo quản</button>
        </div>

        <div className="tab-content">
        {activeTab === 'description' && (
            <div>
                {(product.description || 'Không có mô tả').split('\n').map((line, index) => (
                <React.Fragment key={index}>
                    {line}
                    <br/>
                </React.Fragment>
                ))}
            </div>
            )}


          {activeTab === 'ingredients' && (
            <div>
              {ingredients.length > 0 ? (
                <table className="ingredient-table">
                  <thead>
                    <tr>
                      <th>Thành phần</th>
                      <th>Tỉ lệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient, index) => (
                      <tr key={index}>
                        <td>{ingredient.name}</td>
                        <td>{ingredient.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : 'Không có thành phần'}
            </div>
          )}

          {activeTab === 'uses' && <div>{product.uses || 'Không có công dụng'}</div>}
          {activeTab === 'how_use' && <div>{product.how_use || 'Không có hướng dẫn sử dụng'}</div>}
          {activeTab === 'side_effects' && <div>{product.side_effects || 'Không có thông tin tác dụng phụ'}</div>}
          {activeTab === 'notes' && <div>{product.notes || 'Không có lưu ý'}</div>}
          {activeTab === 'preserve' && <div>{product.preserve || 'Không có hướng dẫn bảo quản'}</div>}

        </div>
      </div>
    </div>
  );
};

export default ProductInformation;
