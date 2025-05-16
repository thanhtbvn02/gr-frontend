import React, { useState, useEffect } from "react";
import "./Cart.css";
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import { updateQuantity, removeFromCart } from '../../redux/addCart';
import Header from "../../components/Header/Header";


function CartPage() {
  const cartItems = useSelector(state => state.cart.cartId);
  const itemQuantities = useSelector(state => state.cart.cartItems);
  const isLoggedIn = useSelector(state => state.cart.isLoggedIn);
  const dispatch = useDispatch();
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItemIds, setCartItemIds] = useState({});
  const [productImages, setProductImages] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        if (cartItems.length > 0) {
          if (isLoggedIn) {
            // Thêm allowDuplicate để ngăn việc hủy request
            const cartResponse = await axiosInstance.get('http://localhost:5000/api/cart', { 
              allowDuplicate: true 
            });
            
            const cartData = cartResponse.data;
            const itemIdMap = {};
            cartData.forEach(item => {
              itemIdMap[item.product_id] = item.id;
            });
            setCartItemIds(itemIdMap);
    
            const productPromises = cartItems.map(id => 
              axiosInstance.get(`http://localhost:5000/api/products/${id}`, { allowDuplicate: true })
            );
            
            // Xử lý từng promise riêng lẻ, không dừng khi một request lỗi
            const productsData = {};
            const imagesData = {};
            
            for (const id of cartItems) {
              try {
                const response = await axiosInstance.get(`http://localhost:5000/api/products/${id}`, { allowDuplicate: true });
                const product = response.data;
                productsData[product.id] = product;
                
                // Lấy ảnh đầu tiên cho sản phẩm
                const imgRes = await axiosInstance.get(`http://localhost:5000/api/images?product_id=${product.id}`, { allowDuplicate: true });
                const firstImage = imgRes.data?.[0]?.url || null;
                imagesData[product.id] = firstImage;
              } catch (productErr) {
                console.error(`Không thể tải sản phẩm ID ${id}:`, productErr);
                // Chỉ log lỗi, không dừng toàn bộ tiến trình
              }
            }
            
            setProducts(productsData);
            setProductImages(imagesData);
          } else {
            // Xử lý khi chưa đăng nhập
            const productsData = {};
            const imagesData = {};
            
            for (const id of cartItems) {
              try {
                const response = await axiosInstance.get(`http://localhost:5000/api/products/${id}`, { allowDuplicate: true });
                const product = response.data;
                productsData[product.id] = product;
                
                // Lấy ảnh đầu tiên cho sản phẩm
                const imgRes = await axiosInstance.get(`http://localhost:5000/api/images?product_id=${product.id}`, { allowDuplicate: true });
                const firstImage = imgRes.data?.[0]?.url || null;
                imagesData[product.id] = firstImage;
              } catch (productErr) {
                console.error(`Không thể tải sản phẩm ID ${id}:`, productErr);
              }
            }
            
            setProducts(productsData);
            setProductImages(imagesData);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu giỏ hàng:", err);
        // Chỉ hiển thị lỗi khi không có sản phẩm nào được tải thành công
        if (Object.keys(products).length === 0) {
          setError('Không thể tải thông tin sản phẩm');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [cartItems, isLoggedIn]);

  const totalAmount = selectedItems.reduce((total, productId) => {
    const product = products[productId];
    const quantity = itemQuantities[productId] || 0;
    return product ? total + (product.price * quantity) : total;
  }, 0);

  const handleSelectIndividual = (e, productId) => {
    const checked = e.target.checked;
    setSelectedItems(prevSelectedItems => {
      if (checked && !prevSelectedItems.includes(productId)) {
        return [...prevSelectedItems, productId];
      } else if (!checked && prevSelectedItems.includes(productId)) {
        return prevSelectedItems.filter(id => id !== productId);
      }
      return prevSelectedItems;
    });
  };

  const handleUpdateQuantity = async (e, productId, newQuantity) => {
    e.preventDefault();
    e.stopPropagation();
        
    try {
      setLoading(true);
      
      // Nếu số lượng <= 0, chuyển sang xóa sản phẩm
      if (newQuantity <= 0) {
        await handleRemoveItem(e, productId);
        return;
      }
      
      // Gọi action updateQuantity từ Redux
      await dispatch(updateQuantity(productId, newQuantity));
      
      setLoading(false);
      setAlertMessage('Đã cập nhật số lượng');
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 1500);
    } catch (err) {
      console.error('Lỗi khi cập nhật số lượng:', err);
      setError('Không thể cập nhật số lượng sản phẩm');
      setAlertType('error');
      setLoading(false);
    }
  };

  const handleRemoveItem = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setLoading(true);
      
      // Cập nhật UI trước khi thực hiện các API call
      const updatedProducts = {...products};
      delete updatedProducts[productId];
      setProducts(updatedProducts);
      
      // Cập nhật danh sách sản phẩm đã chọn
      setSelectedItems(prev => prev.filter(id => id !== productId));
      
      // Gọi action removeFromCart từ Redux
      await dispatch(removeFromCart(productId));
      
      // Hiển thị thông báo xóa thành công
      setAlertMessage('Đã xóa sản phẩm khỏi giỏ hàng');
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 1500);
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      setError('Không thể xóa sản phẩm khỏi giỏ hàng');
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  // Lọc sản phẩm có số lượng > 0 để hiển thị trong giỏ hàng
  const validCartItems = Object.keys(products).filter(id => 
    itemQuantities[id] && itemQuantities[id] > 0
  );

  // Kiểm tra xem giỏ hàng có thực sự trống không
  const isCartEmpty = validCartItems.length === 0;

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      setError('Vui lòng đăng nhập để thanh toán');
      return;
    }
    
    if (selectedItems.length === 0) {
      setError('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    
    try {
      setLoading(true);
      
      // Lấy địa chỉ mặc định của người dùng
      const userId = localStorage.getItem('userId');
      const addressResponse = await axiosInstance.get(`http://localhost:5000/api/addresses/user/${userId}`);
      const addresses = addressResponse.data;
      const defaultAddress = addresses.find(addr => addr.is_default);
      
      if (!defaultAddress) {
        setError('Không tìm thấy địa chỉ mặc định. Vui lòng thêm địa chỉ trong trang quản lý tài khoản.');
        setLoading(false);
        return;
      }
      
      // Đảm bảo tất cả các sản phẩm được chọn đều tồn tại
      const validSelectedItems = selectedItems.filter(productId => products[productId]);
      
      if (validSelectedItems.length === 0) {
        setError('Không tìm thấy thông tin của sản phẩm đã chọn. Vui lòng làm mới trang.');
        setLoading(false);
        return;
      }
      
      // Chỉ lấy các sản phẩm đã được chọn để thanh toán và đảm bảo chúng tồn tại
      const orderItems = [];
      for (const productId of validSelectedItems) {
        const product = products[productId];
        if (product && product.price) {
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
        orderItems: orderItems
      };
      
      await axiosInstance.post('/orders', orderData);
      
      // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
      for (const productId of validSelectedItems) {
        if (isLoggedIn) {
          const cartItemId = cartItemIds[productId];
          if (cartItemId) {
            try {
              await axiosInstance.delete(`http://localhost:5000/api/cart/${cartItemId}`);
            } catch (err) {
              console.error(`Lỗi khi xóa sản phẩm ${productId} sau khi đặt hàng:`, err);
            }
          }
        }
        // Cập nhật state và Redux
        dispatch(removeFromCart(productId));
      }
      
      // Làm mới lại trạng thái
      setSelectedItems([]);
      setLoading(false);
      setAlertMessage('Đặt hàng thành công!');
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
      
      // Để đảm bảo rằng giỏ hàng được cập nhật đúng
      window.location.reload();
    } catch (err) {
      console.error('Lỗi khi đặt hàng:', err);
      setError(err.response?.data?.message || 'Không thể hoàn tất đơn hàng');
      setAlertType('error');
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="cart-container">
        <h1 className="cart-title">Giỏ hàng của bạn</h1>
        
        {showAlert && (
          <div className={`alert ${alertType === 'error' ? 'alert-error' : 'alert-success'}`}>
            {alertMessage}
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : isCartEmpty ? (
          <div className="empty-cart">
            <p>Giỏ hàng của bạn đang trống</p>
            <Link to="/" className="continue-shopping">Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th className="checkbox-column">Chọn</th>
                    <th className="image-column">Hình ảnh</th>
                    <th className="name-column">Tên sản phẩm</th>
                    <th className="price-column">Đơn giá</th>
                    <th className="quantity-column">Số lượng</th>
                    <th className="total-column">Thành tiền</th>
                    <th className="action-column">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {validCartItems.map(productId => {
                    const product = products[productId];
                    const quantity = itemQuantities[productId] || 0;
                    
                    if (!product || quantity <= 0) return null;
                    
                    return (
                      <tr key={productId} className="cart-item">
                        <td className="checkbox-column">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(productId)}
                            onChange={(e) => handleSelectIndividual(e, productId)}
                          />
                        </td>
                        <td className="image-column">
                          <div className="product-image">
                            {productImages[productId] ? (
                              <img src={productImages[productId]} alt={product.name} />
                            ) : (
                              <div className="no-image">Không có ảnh</div>
                            )}
                          </div>
                        </td>
                        <td className="name-column">
                        <Link to={`/productInfor/${product.id}`}>{product.name}</Link>
                        </td>
                        <td className="price-column">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                        </td>
                        <td className="quantity-column">
                          <div className="quantity-control">
                            <button
                              className="quantity-btn decrease"
                              onClick={(e) => handleUpdateQuantity(e, productId, quantity - 1)}
                              disabled={quantity <= 1}
                            >
                              -
                            </button>
                            <span className="quantity">{quantity}</span>
                            <button
                              className="quantity-btn increase"
                              onClick={(e) => handleUpdateQuantity(e, productId, quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="total-column">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price * quantity)}
                        </td>
                        <td className="action-column">
                          <button
                            className="remove-btn"
                            onClick={(e) => handleRemoveItem(e, productId)}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="cart-summary">
              <div className="summary-header">Tổng thanh toán</div>
              <div className="summary-row">
                <span>Số sản phẩm đã chọn:</span>
                <span>{selectedItems.length}</span>
              </div>
              <div className="summary-row">
                <span>Tổng tiền:</span>
                <span className="total-price">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                </span>
              </div>
              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
              >
                Thanh toán
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CartPage;
