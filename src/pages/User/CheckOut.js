import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import axios from 'axios';
import { removeFromCart, setSelectedItems } from '../../redux/addCart';
import Header from "../../components/Header/Header";
import "./CheckOut.css";

function CheckOut() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const itemQuantities = useSelector(state => state.cart.cartItems);
  const isLoggedIn = useSelector(state => state.cart.isLoggedIn);
  
  const [products, setProducts] = useState({});
  const [productImages, setProductImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [cartItemIds, setCartItemIds] = useState({});
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [orderNote, setOrderNote] = useState('');

  // Shipping fee
  const shippingFee = 20000;

  const reduxSelectedItems = useSelector(state => state.cart.selectedItems || []);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  useEffect(() => {
    if (reduxSelectedItems.length > 0) {
      setSelectedProductIds(reduxSelectedItems);
    } else {
      const local = localStorage.getItem('selectedItems');
      console.log(local);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            setSelectedProductIds(parsed);
            dispatch(setSelectedItems(parsed));
          }
        } catch (err) {
          console.error('Lỗi khi đọc selectedItems từ localStorage:', err);
        }
      }
    }
  }, [reduxSelectedItems, dispatch]);

  useEffect(() => {
    if (!isLoggedIn) {
      setAlertMessage('Vui lòng đăng nhập để thanh toán');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    console.log('Token:', token ? 'Có token' : 'Không có token');
    console.log('UserId:', userId);

    if (!token || !userId) {
      setAlertMessage('Thông tin đăng nhập không đầy đủ, vui lòng đăng nhập lại');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    // if (!selectedProductIds || selectedProductIds.length === 0) {
    //   setAlertMessage('Không có sản phẩm nào được chọn để thanh toán');
    //   setAlertType('error');
    //   setShowAlert(true);
    //   setTimeout(() => {
    //     navigate('/cart');
    //   }, 2000);
    //   return;
    // }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user address
        const cleanUserId = encodeURIComponent(userId);
        let addressResponse, addresses, defaultAddr;
        
        try {
          // Sử dụng axios trực tiếp với URL đầy đủ
          const token = localStorage.getItem('accessToken');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          
          addressResponse = await axios.get(`https://gr-backend.onrender.com/api/addresses/user/${cleanUserId}`, { 
            headers,
            timeout: 10000
          });
          addresses = addressResponse.data || [];
          
          if (!addresses || addresses.length === 0) {
            setShowAlert(true);
            setAlertMessage('Bạn chưa có địa chỉ giao hàng. Bạn muốn thêm địa chỉ ngay bây giờ không?');
            setAlertType('warning');
            
            const confirmNavigation = window.confirm('Bạn chưa có địa chỉ giao hàng. Bạn muốn thêm địa chỉ ngay bây giờ không?');
            if (confirmNavigation) {
              navigate('/profile/address');
              return;
            } else {
              navigate('/cart');
              return;
            }
          }
          
          defaultAddr = addresses.find(addr => addr.is_default) || addresses[0];
          setDefaultAddress(defaultAddr);
        } catch (addrErr) {
          console.error('Lỗi khi tải địa chỉ:', addrErr);
          throw new Error('Không thể tải địa chỉ giao hàng');
        }

        // Fetch cart items for IDs
        let cartResponse;
        try {
          const token = localStorage.getItem('accessToken');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          
          cartResponse = await axios.get('https://gr-backend.onrender.com/api/cart', { 
            headers,
            timeout: 10000
          });
          
          const cartData = cartResponse.data || [];
          const itemIdMap = {};
          
          if (cartData && Array.isArray(cartData)) {
            cartData.forEach(item => {
              if (item && item.product_id) {
                itemIdMap[item.product_id] = item.id;
              }
            });
          }
          setCartItemIds(itemIdMap);
        } catch (cartErr) {
          console.error('Lỗi khi tải giỏ hàng:', cartErr);
          // Không throw lỗi ở đây, tiếp tục tải sản phẩm
        }

        // Fetch product data and images
        const productsData = {};
        const imagesData = {};
        
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        for (const id of selectedProductIds) {
          if (!id) continue; // Skip invalid IDs
          
          try {
            const response = await axios.get(`https://gr-backend.onrender.com/api/products/${id}`, { 
              headers,
              timeout: 10000
            });
            
            if (response.data) {
              const product = response.data;
              productsData[product.id] = product;
              
              // Get first image for product
              try {
                const imgRes = await axios.get(`https://gr-backend.onrender.com/api/images?product_id=${product.id}`, {
                  headers, 
                  timeout: 10000
                });
                const imageData = imgRes.data || [];
                const firstImage = imageData[0]?.url || null;
                imagesData[product.id] = firstImage;
              } catch (imgErr) {
                console.error(`Không thể tải ảnh cho sản phẩm ID ${id}:`, imgErr);
                // Không có ảnh vẫn tiếp tục
              }
            }
          } catch (err) {
            console.error(`Không thể tải sản phẩm ID ${id}:`, err);
            // Không throw lỗi, tiếp tục với sản phẩm khác
          }
        }
        
        setProducts(productsData);
        setProductImages(imagesData);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu thanh toán:", err);
        setError('Không thể tải thông tin thanh toán');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedProductIds, isLoggedIn, navigate]);

  // Calculate total amount
  const subtotal = selectedProductIds.reduce((total, productId) => {
    const product = products[productId];
    const quantity = itemQuantities[productId] || 0;
    return product ? total + (product.price * quantity) : total;
  }, 0);
  
  const totalAmount = subtotal + shippingFee;

  const handlePlaceOrder = async () => {
    if (!isLoggedIn || !defaultAddress) {
      setAlertMessage('Không thể đặt hàng: Vui lòng đăng nhập và cung cấp địa chỉ giao hàng');
      setAlertType('error');
      setShowAlert(true);
      return;
    }
    
    try {
      setLoading(true);
      
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      // Prepare order items
      const orderItems = [];
      for (const productId of selectedProductIds) {
        const product = products[productId];
        if (product && product.price && productId) {
          orderItems.push({
            product_id: productId,
            quantity: itemQuantities[productId] || 0,
            unit_price: product.price
          });
        }
      }
      
      if (orderItems.length === 0) {
        setError('Không có sản phẩm hợp lệ để đặt hàng.');
        setLoading(false);
        return;
      }
      
      const orderData = { 
        user_id: userId,
        address_id: defaultAddress.id,
        payment_method: 'cash_on_delivery',
        message: orderNote || '',
        orderItems: orderItems
      };
      console.log(orderData);
      
      const token = localStorage.getItem('accessToken');
      const headers = token ? { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {};
      
      await axios.post('https://gr-backend.onrender.com/api/orders', orderData, {
        headers,
        timeout: 10000
      });
      
      // Remove ordered products from cart
      for (const productId of selectedProductIds) {
        if (!productId) continue;
        
        const cartItemId = cartItemIds[productId];
        if (cartItemId) {
          try {
            await axios.delete(`https://gr-backend.onrender.com/api/cart/${cartItemId}`, {
              headers,
              timeout: 10000
            });
          } catch (err) {
            console.error(`Lỗi khi xóa sản phẩm ${productId} sau khi đặt hàng:`, err);
          }
        }
        // Update Redux state
        dispatch(removeFromCart(productId));
      }
      
      setLoading(false);
      setAlertMessage('Đặt hàng thành công!');
      setAlertType('success');
      setShowAlert(true);
      
      // Navigate back to home or orders page after successful order
      setTimeout(() => {
        localStorage.removeItem('selectedItems');
        navigate('/');
      }, 2000);
      
    } catch (err) {
      console.error('Lỗi khi đặt hàng:', err);
      setError(err.response?.data?.message || 'Không thể hoàn tất đơn hàng');
      setAlertType('error');
      setShowAlert(true);
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="checkout-container">
        <h1 className="checkout-title">Xác nhận đơn hàng</h1>
        
        {showAlert && (
          <div className={`alert ${alertType === 'error' ? 'alert-error' : alertType === 'warning' ? 'alert-warning' : 'alert-success'}`}>
            {alertMessage}
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <div className="checkout-content">
            <div className="checkout-items">
              <h2>Sản phẩm đã chọn</h2>
              <table className="checkout-table">
                <thead>
                  <tr>
                    <th className="image-column">Hình ảnh</th>
                    <th className="name-column">Tên sản phẩm</th>
                    <th className="price-column">Đơn giá</th>
                    <th className="quantity-column">Số lượng</th>
                    <th className="total-column">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProductIds.map(productId => {
                    if (!productId) return null;
                    
                    const product = products[productId];
                    const quantity = itemQuantities[productId] || 0;
                    
                    if (!product || quantity <= 0) return null;
                    
                    return (
                      <tr key={productId} className="checkout-item">
                        <td className="image-column">
                          <div className="product-image">
                            {productImages[productId] ? (
                              <img src={productImages[productId]} alt={product.name || 'Sản phẩm'} />
                            ) : (
                              <div className="no-image">Không có ảnh</div>
                            )}
                          </div>
                        </td>
                        <td className="name-column">{product.name || 'Không có tên'}</td>
                        <td className="price-column">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
                        </td>
                        <td className="quantity-column">{quantity}</td>
                        <td className="total-column">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((product.price || 0) * quantity)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="checkout-address">
              <h2>Địa chỉ giao hàng</h2>
              {defaultAddress ? (
                <div className="address-detail">
                  <p><strong>Người nhận:</strong> {defaultAddress.recipient_name || 'Không có tên'}</p>
                  <p><strong>Số điện thoại:</strong> {defaultAddress.phone || 'Không có số điện thoại'}</p>
                  <p><strong>Địa chỉ:</strong> {defaultAddress.address || ''}, {defaultAddress.ward || ''}, {defaultAddress.district || ''}, {defaultAddress.province || ''}</p>
                </div>
              ) : (
                <div className="no-address">
                  <p>Bạn chưa có địa chỉ giao hàng</p>
                  <button onClick={() => navigate('/profile/address')} className="add-address-btn">
                    Thêm địa chỉ mới
                  </button>
                </div>
              )}
            </div>

            <div className="order-note">
              <h2>Ghi chú đơn hàng</h2>
              <textarea 
                placeholder="Nhập ghi chú đơn hàng (tùy chọn)" 
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                rows={3}
                className="note-input"
              />
            </div>
            
            <div className="checkout-summary">
              <div className="summary-header">Tổng thanh toán</div>
              <div className="summary-row">
                <span>Tổng tiền hàng:</span>
                <span>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
                </span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}
                </span>
              </div>
              <div className="summary-row total">
                <span>Tổng thanh toán:</span>
                <span className="total-price">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                </span>
              </div>
              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={!defaultAddress || selectedProductIds.length === 0}
              >
                Đặt hàng
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CheckOut;