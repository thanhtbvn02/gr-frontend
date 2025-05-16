import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './ProductInformation.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../redux/addCart';

const ProductInformation = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [details, setDetails] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  
  // Sử dụng Redux thay vì useCart hook
  const isLoggedIn = useSelector(state => state.cart.isLoggedIn);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data: productData } = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(productData);

        const { data: imageData } = await axios.get(
          `http://localhost:5000/api/images?product_id=${productData.id}`
        );
        const urls = imageData.map(img => img.url);
        setImages(urls);
        setSelectedImage(urls[0] || '');

        const { data: detailData } = await axios.get(
          `http://localhost:5000/api/details?product_id=${productData.id}`
        );
        setDetails(detailData);

        const { data: ingredientData } = await axios.get(
          `http://localhost:5000/api/ingredients?product_id=${productData.id}`
        );
        setIngredients(ingredientData);
      } catch (error) {
        console.error('Error fetching product info', error);
      }
    };
    fetchProduct();
  }, [id]);
  
  // Xử lý thay đổi số lượng
  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = () => {
    try {
      // Sửa lại cách gọi Redux dispatch để truyền tham số đúng cách
      dispatch(addToCart(id, quantity));
      
      setAlertMessage(isLoggedIn 
        ? 'Thêm vào giỏ hàng thành công!' 
        : 'Sản phẩm đã được thêm vào giỏ hàng tạm thời');
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      setAlertMessage('Có lỗi xảy ra khi thêm vào giỏ hàng!');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };
  
  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  return (
    <div className="product-detail-container">
      <Header />
      
      {showAlert && (
        <div className={`alert ${alertType === 'success' ? 'alert-success' : 'alert-error'}`}>
          {alertMessage}
        </div>
      )}
      
      <div className="product-detail-top">
        <div className="product-detail-images">
          <img
            src={selectedImage || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="main-image"
          />
          <div className="thumbnail-container">
            {images.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`thumbnail-${idx}`}
                className={`thumbnail-image ${url === selectedImage ? 'active' : ''}`}
                onClick={() => setSelectedImage(url)}
              />
            ))}
          </div>
        </div>
        <div className="product-detail-info">
          <h1 className="product-title">{product.name}</h1>
          <div className="product-price">
            {product.price && formatPrice(product.price)}
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
            <button onClick={decreaseQuantity}>-</button>
            <input 
              type="number" 
              min="1" 
              value={quantity}
              onChange={handleQuantityChange}
            />
            <button onClick={increaseQuantity}>+</button>
          </div>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
          <button className="find-at-pharmacy-btn">Tìm nhà thuốc</button>
        </div>
      </div>
      <div className="product-detail-tabs">
        <div className="tab-buttons">
          <button
            className={activeTab === 'description' ? 'active' : ''}
            onClick={() => setActiveTab('description')}
          >
            Mô tả sản phẩm
          </button>
          <button
            className={activeTab === 'ingredients' ? 'active' : ''}
            onClick={() => setActiveTab('ingredients')}
          >
            Thành phần
          </button>
          <button
            className={activeTab === 'uses' ? 'active' : ''}
            onClick={() => setActiveTab('uses')}
          >
            Công dụng
          </button>
          <button
            className={activeTab === 'directions' ? 'active' : ''}
            onClick={() => setActiveTab('directions')}
          >
            Cách dùng
          </button>
          <button
            className={activeTab === 'sideEffects' ? 'active' : ''}
            onClick={() => setActiveTab('sideEffects')}
          >
            Tác dụng phụ
          </button>
          <button
            className={activeTab === 'storage' ? 'active' : ''}
            onClick={() => setActiveTab('storage')}
          >
            Bảo quản
          </button>
        </div>
        <div className="tab-content">
          {activeTab === 'description' && <div><div className='tab-content-title'>Mô tả sản phẩm</div>{product.description}</div>}
          {activeTab === 'ingredients' && (
            <div>
              <div className='tab-content-title'>Thành phần</div>
              <table className="ingredient-table">
                <thead>
                  <tr>
                  <th>Thành phần</th>
                  <th>Số lượng</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ing, idx) => (
                  <tr key={idx}>
                    <td>{ing.name}</td>
                    <td>{ing.quantity}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'uses' && <div><div className='tab-content-title'>Công dụng</div>{product.uses}</div>}
          {activeTab === 'directions' && <div><div className='tab-content-title'>Cách dùng</div>{product.how_use}</div>}
          {activeTab === 'sideEffects' && <div><div className='tab-content-title'>Tác dụng phụ</div>{product.side_effects}</div>}
          {activeTab === 'storage' && <div><div className='tab-content-title'>Bảo quản</div>{product.preserve}</div>}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductInformation;
